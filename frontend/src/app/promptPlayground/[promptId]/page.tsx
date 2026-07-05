"use client";
import { useForm, SubmitHandler } from "react-hook-form";
import { Prompt, Version, Run } from "@prisma/client";
import { use, useEffect, useState } from "react";
import {
  fetchPrompt,
  fetchVersion,
  fetchRunsByPrompt,
  createVersion,
  updatePrompt,
  createRun,
} from "@/lib/apiClient";

type Inputs = {
  temperature: number;
  top_p_value: number;
  max_tokens: number;
  name: string;
  description: string;
  message: string;
};

type RunInputs = {
  score: number;
  notes: string;
};

function extractMessage(versionMessages: unknown): string {
  try {
    const parsed =
      typeof versionMessages === "string"
        ? JSON.parse(versionMessages)
        : versionMessages;
    return parsed?.message ?? "";
  } catch {
    return "";
  }
}

export default function PromptPlayground({
  params,
}: {
  params: Promise<{ promptId: string }>;
}) {
  const { promptId } = use(params);
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [version, setVersion] = useState<Version | null>(null);
  const [runs, setRuns] = useState<Run[]>([]);

  const {
    register,
    handleSubmit,
    getValues,
    reset,
    formState: { errors },
  } = useForm<Inputs>();

  const {
    register: registerRun,
    handleSubmit: submitRun,
    formState: { errors: runErrors },
  } = useForm<RunInputs>();

  useEffect(() => {
    const load = async () => {
      const loadedPrompt = await fetchPrompt(promptId);
      setPrompt(loadedPrompt);

      if (loadedPrompt?.Best_Version_Id) {
        const loadedVersion = await fetchVersion(loadedPrompt.Best_Version_Id);
        setVersion(loadedVersion);
        reset({
          name: loadedPrompt.Name,
          description: loadedVersion.Description ?? "",
          temperature: loadedVersion.Default_Temperature,
          top_p_value: loadedVersion.Default_Top_P,
          max_tokens: loadedVersion.Default_Max_Tokens,
          message: extractMessage(loadedVersion.Version_Messages),
        });
      } else {
        reset({ name: loadedPrompt.Name });
      }

      setRuns(await fetchRunsByPrompt(promptId));
    };

    load().catch((err) => console.error(err));
  }, [promptId, reset]);

  const formSubmit: SubmitHandler<Inputs> = async (data) => {
    if (!prompt) return;
    try {
      const newVersion = await createVersion({
        name: data.name,
        description: data.description,
        def_temperature: Number(data.temperature),
        default_top_p: Number(data.top_p_value),
        default_max_tokens: Number(data.max_tokens),
        message: data.message,
        prompt_id: prompt.id,
      });
      const updated = await updatePrompt(prompt.id, {
        Name: data.name,
        Description: data.description,
        Best_Version_Id: newVersion.id,
      });
      setPrompt(updated);
      setVersion(newVersion);
      alert("New prompt version saved!");
    } catch (err) {
      alert(`Failed to save version: ${err}`);
    }
  };

  const runSubmit: SubmitHandler<RunInputs> = async (data) => {
    if (!prompt) return;
    try {
      const values = getValues();
      await createRun({
        Prompt_Id: prompt.id,
        Version_Id: prompt.Best_Version_Id ?? version?.id ?? null,
        Temperature: Number(values.temperature),
        Top_P: Number(values.top_p_value),
        Max_Tokens: Number(values.max_tokens),
        Output_Quality: { score: Number(data.score), notes: data.notes },
      });
      setRuns(await fetchRunsByPrompt(promptId));
      alert("Run saved!");
    } catch (err) {
      alert(`Failed to save run: ${err}`);
    }
  };

  return (
    <div className="bg-black w-screen h-screen flex flex-col">
      <form className="flex flex-col" onSubmit={handleSubmit(formSubmit)}>
        <div className="bg-gray-700 flex flex-row ">
          <input {...register("name")} placeholder="Prompt Name" />
          <input
            type="number"
            step="any"
            {...register("temperature")}
            placeholder="Temperature"
          />
          <input
            type="number"
            step="any"
            {...register("top_p_value")}
            placeholder="Top P"
          />
          <input
            type="number"
            {...register("max_tokens")}
            placeholder="Max Tokens"
          />
        </div>
        <div>
          <textarea {...register("description")} placeholder="Description" />
        </div>
        <div>
          <textarea {...register("message")} placeholder="Message" />
        </div>
        <input
          type="submit"
          value="Save New Prompt Version!"
          className="rounded-xl bg-green-500 p-4 text-white"
        />
      </form>

      <form onSubmit={submitRun(runSubmit)}>
        <div className="flex flex-row">
          <div>OUTPUT HERE</div>
          <div className="flex flex-col">
            <input
              type="number"
              placeholder="Score"
              {...registerRun("score", { required: true })}
            />
            <input placeholder="Notes" {...registerRun("notes")} />
            <input
              type="submit"
              value="Save Run"
              className="bg-gray-800 text-white rounded-xl p-4"
            />
          </div>
        </div>
      </form>

      <div>
        <h1> Previous Run History </h1>
        <div className="flex flex-col justify-center items-center p-4">
          {runs.length === 0 ? (
            <div className="text-white">No runs yet.</div>
          ) : (
            runs.map((run) => (
              <div key={run.id} className="flex flex-row text-white">
                <div>{new Date(run.Executed_At).toLocaleString()}</div>
                <div className="flex flex-col">
                  <div>Status: {run.Status}</div>
                  <div>Quality: {JSON.stringify(run.Output_Quality)}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

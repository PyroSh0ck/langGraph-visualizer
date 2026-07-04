"use client";
import { useForm, SubmitHandler } from "react-hook-form";

import { use } from "react";

type Inputs = {
  temperature: Number;
  top_p_value: Number;
  max_tokens: Number;
  name: String;
  description: String;
  message: String;
};

type RunInputs = {
  score: Number;
  notes: String;
};

export default function PromptPlayground({
  params,
}: {
  params: Promise<{ promptId: string }>;
}) {
  const { promptId } = use(params);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>();

  const {
    register: registerRun,
    handleSubmit: submitRun,
    formState: { errors: runErrors },
  } = useForm<RunInputs>();

  // need to add default values after fetching get request

  const formSubmit: SubmitHandler<Inputs> = async (data: Inputs) => {
    // patch request to update prompt name, description, best version, and updated at
    // post request to create version with all the other information
    alert("Form has been submitted!");
  };

  const runSubmit: SubmitHandler<RunInputs> = async (data: RunInputs) => {
    // post request to create a run with all those specifications
    alert("Run has been submitted");
  };

  return (
    <div className="bg-black w-screen h-screen flex flex-col">
      <form className="flex flex-col">
        <div className="bg-gray-700 flex flex-row ">
          <input {...register("name")} value="Prompt Name" />
          <input
            type="number"
            {...register("temperature")}
            value="Prompt Temperature"
          />
          <input
            type="number"
            {...register("top_p_value")}
            value="Prompt Temperature"
          />
          <input
            type="number"
            {...register("max_tokens")}
            value="Prompt Temperature"
          />
        </div>
        <div>
          <textarea {...register("description")} />
        </div>
        <div>
          <textarea {...register("message")} />
        </div>
        <input
          onSubmit={handleSubmit(formSubmit)}
          type="submit"
          value="Save New Prompt Version!"
          className="rounded-xl bg-green-500 p-4 text-white"
        />
      </form>
      <form>
        <div className="flex flex-row">
          <div>OUTPUT HERE</div>
          <div className="flex flex-col">
            <button className="bg-green-500 text-white rounded-xl">Run</button>
            <input
              type="number"
              {...(registerRun("score"), { required: true })}
            />
            <input {...registerRun("notes")} />
            <input
              type="submit"
              value="Save Run"
              onSubmit={submitRun(runSubmit)}
              className="bg-gray-800 text-white rounded-xl p-4"
            />
          </div>
        </div>
      </form>

      <div>
        <h1> Previous Run History </h1>
        <div className="flex flex-col justify-center items-center p-4">
          <div className="flex flex-row">
            <div>OUTPUT</div>
            <div className="flex flex-col">
              <div>Score (10/10)</div>
              <button className="rounded-xl bg-gray-800 text-white p-3">
                Notes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

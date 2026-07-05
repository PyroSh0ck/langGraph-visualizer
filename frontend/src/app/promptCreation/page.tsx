"use client";
import { useForm, SubmitHandler } from "react-hook-form";

type Inputs = {
  name: String;
  description: String;
  def_temperature: Number;
  default_top_p: Number;
  default_max_tokens: Number;
  message: String;
};

const defaultValueObj = {
  defaultValues: {
    name: "",
    description: "",
    def_temperature: 0.0,
    default_top_p: 0.0,
    default_max_tokens: 0,
    message: "",
  },
};
export default function promptCreation() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>(defaultValueObj);

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    try {
      const response = await fetch("/api/prompts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        alert("Failed to create prompt!");
        return;
      }

      const prompt = await response.json();
      console.log("Success :D", response);

      alert("Prompt created successfully");

      const versionResponse = await fetch("/api/versions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          prompt_id: prompt.id,
        }),
      });

      if (!versionResponse.ok) {
        alert("Failed to create version");
        return;
      }

      const version = await versionResponse.json();

      const promptResponse = await fetch(`/api/prompts/${prompt.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Best_Version_Id: version.id,
        }),
      });

      if (!promptResponse.ok) {
        alert("Failed to UPDATE prompt with best version");
        return;
      }
    } catch (err) {
      alert(`Error has occurred: ${err}`);
    }
    alert("Submitted Form :D");
    console.log(data);
  };
  return (
    <div className="bg-gray-800 h-screen w-screen ">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col justify-center "
      >
        <div className="bg-gray-500 flex flex-row justify-center items-center">
          <label className="ml-4">Name: </label>
          <input
            {...register("name", { required: true })}
            className="bg-white rounded-xl p-3 m-2 text-black"
          />
        </div>
        <div className="bg-gray-500 flex flex-row justify-center items-center">
          <label>Description: </label>
          <textarea
            {...register("description")}
            className="bg-white rounded-xl p-3 m-2 text-black"
          />
        </div>
        <div className="bg-gray-500 flex flex-row justify-center items-center">
          <label>Default Temperature: </label>
          <input
            type="number"
            {...register("def_temperature")}
            className="bg-white rounded-xl p-3 m-2 text-black"
          />
        </div>
        <div className="bg-gray-500 flex flex-row justify-center items-center">
          <label>Default Top P: </label>
          <input
            type="number"
            {...register("default_top_p")}
            className="bg-white rounded-xl p-3 m-2 text-black"
          />
        </div>
        <div className="bg-gray-500 flex flex-row justify-center items-center">
          <label>Default Max Tokens: </label>
          <input
            type="number"
            {...register("default_max_tokens")}
            className="bg-white rounded-xl p-3 m-2 text-black"
          />
        </div>
        <div className="bg-gray-500 flex flex-row justify-center items-center">
          <label> Message: </label>
          <input
            {...register("message", { required: true })}
            className="bg-white rounded-xl p-3 m-2 text-black"
          />
        </div>
        <div className="bg-gray-500 flex flex-row justify-center items-center">
          <input
            type="submit"
            className="bg-white rounded-xl p-3 m-2 text-black"
          />
        </div>
      </form>
    </div>
  );
}

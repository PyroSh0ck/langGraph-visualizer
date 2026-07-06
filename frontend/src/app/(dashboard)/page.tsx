import { PromptViewer } from "@/components/viewers/prompt-viewer";
import { RunViewer } from "@/components/viewers/run-viewer";

export default function Dashboard() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      </div>

      <section>
        <h2 className="text-xl font-bold mb-4">Prompts</h2>
        <PromptViewer compact />
      </section>

      <section>
        <h2 className="text-xl font-bold mb-4">Runs</h2>
        <RunViewer compact />
      </section>
    </div>
  );
}

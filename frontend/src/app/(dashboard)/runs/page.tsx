import { RunViewer } from "@/components/viewers/run-viewer";

export default function RunsPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Runs</h1>
      <RunViewer />
    </div>
  );
}

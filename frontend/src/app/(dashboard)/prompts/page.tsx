import Link from "next/link";
import { PromptViewer } from "@/components/viewers/prompt-viewer";
import { Button } from "@/components/ui/button";

export default function PromptsPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Prompts</h1>
        <Link href="/prompts/new">
          <Button>New Prompt</Button>
        </Link>
      </div>

      <PromptViewer />
    </div>
  );
}

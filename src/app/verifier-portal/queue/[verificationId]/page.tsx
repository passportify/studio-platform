import { VerifierTaskClient } from "@/components/verifier-task-client";
import { mockVerificationTasks } from "@/lib/mock-data";
import type { Metadata } from 'next';

type Props = {
  params: { verificationId: string }
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const task = mockVerificationTasks.find(t => t.verification_id === params.verificationId);
  const taskName = task ? task.document_name : "Task";

  return {
    title: `Review Task: ${taskName}`,
  };
}


export default function VerifierTaskPage({ params }: { params: { verificationId: string } }) {
    const task = mockVerificationTasks.find(t => t.verification_id === params.verificationId);

    if (!task) {
        return (
            <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                <div className="w-full max-w-6xl mx-auto flex flex-col gap-8 text-center text-destructive">
                    Verification task not found.
                </div>
            </main>
        )
    }

  return (
    <main className="flex flex-1 flex-col gap-8 p-4 md:p-8">
        <header>
            <div>
            <h1 className="font-headline text-3xl font-bold tracking-tight">
                Review Task: {task.document_name}
            </h1>
            <p className="text-muted-foreground">
                Verify the claims and documentation for the product: <span className="font-semibold text-foreground">{task.product_name}</span>.
            </p>
            </div>
        </header>
        <VerifierTaskClient task={task} />
    </main>
  );
}

import { DemoApp } from "@/components/demo/DemoApp";

export const metadata = {
  title: "Live demo",
};

export default function DemoPage() {
  return (
    <main className="flex flex-1 flex-col">
      <DemoApp />
    </main>
  );
}

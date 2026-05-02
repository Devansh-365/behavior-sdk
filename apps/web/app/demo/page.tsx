import { DemoApp } from "@/components/demo/DemoApp";

export const metadata = {
  title: "Live demo — behavior-sdk",
};

export default function DemoPage() {
  return (
    <main className="flex flex-1 flex-col">
      <DemoApp />
    </main>
  );
}

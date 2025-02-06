import { Suspense } from "react";
import ParentComponent from "./ParentComponent";
import ChildComponent from "./ChildComponent";

export default function Page() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <ParentComponent />
      <ChildComponent />
    </Suspense>
  );
}
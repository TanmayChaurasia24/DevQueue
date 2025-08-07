"use client"

import { trpc } from "@/utils/trpc";
import Image from "next/image";
import { useState } from "react";

export default function Home() {
  const [backendresponse, setbackendResponse] = useState<string | undefined>("");
  const mutation = trpc.hello.useMutation();

  const handletesting = () => {
    mutation.mutate(
      { name: "tanmay" },
      {
        onSuccess: (data) => {
          setbackendResponse(data.greeting);
        },
      }
    );
  };

  return (
    <div>
      testing
      <div onClick={handletesting} className="cursor-pointer">
        click me
      </div>
      {backendresponse}
    </div>
  );
}

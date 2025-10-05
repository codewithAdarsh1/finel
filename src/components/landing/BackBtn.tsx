"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

const BackBtn = ({ setStory }: { story: boolean, setStory: (story: boolean) => void }) => {
  return (
    <div className="fixed top-5 right-5 z-[1000]">
      <Button variant="ghost" size="icon" onClick={() => setStory(false)}>
        <X className="h-8 w-8 text-white" />
        <span className="sr-only">Close</span>
      </Button>
    </div>
  );
};

export default BackBtn;

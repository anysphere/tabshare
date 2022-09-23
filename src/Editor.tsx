import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import { EditorContent, useEditor } from "@tiptap/react";
import React from "react";

export function WritingBar({
  onUpdate,
  content,
}: {
  onUpdate: (s: string) => void;
  content: string;
}): JSX.Element {
  const editor = useEditor({
    extensions: [Document, Paragraph, Text],
    content: content,
    editorProps: {
      attributes: {
        class:
          "leading-normal prose prose-sm prose-stone focus:outline-none p-2 rounded-md overflow-auto prose-p:mt-0 prose-p:mb-0",
      },
    },
    onUpdate: ({ editor }) => {
      onUpdate(editor.getHTML());
    },
  });

  return <EditorContent editor={editor} />;
}

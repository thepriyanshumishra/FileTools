import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog - File Conversion Tips & Tutorials | FileTools",
  description: "Learn how to convert, compress, and edit files with our comprehensive guides and tutorials. Expert tips for PDF, image, video, and document processing.",
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

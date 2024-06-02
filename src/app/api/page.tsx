import { getApiDocs } from "@/lib/server/swagger";
import ReactSwagger from "@/components/providers/ReactSwagger";

export default async function IndexPage() {
  const spec = await getApiDocs();
  return (
    <main className="flex justify-center">
      <section className="container">
        <ReactSwagger spec={spec} />
      </section>
    </main>
  );
}

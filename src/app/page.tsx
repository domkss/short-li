import LongURLInput from "@/components/LongURLInput";

export default function Home() {
  return (
    <main className='min-h-screen flex flex-col items-center'>
      {/*Main URL input layout*/}
      <div className='absolute top-1/3 container max-w-2xl'>
        <div className='p-4  shadow-md bg-gray-400 bg-opacity-20 border-[1px] border-solid sm:rounded-md border-gray-100'>
          <h3 className='font-medium text-xl ms-3'>Short any long URL for Free</h3>
          <LongURLInput />
        </div>
      </div>
    </main>
  );
}

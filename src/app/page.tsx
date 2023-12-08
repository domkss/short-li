import LongURLInput from "@/components/LongURLInput";

export default function Home() {
  return (
    <main>
      <div className='flex flex-col items-center'>
        {/*Main URL input layout*/}
        <div className='mt-32 max-sm:mt-48 container max-w-2xl shadow-sm sm:rounded-md'>
          <div className='p-4 shadow-md bg-slate-400 bg-opacity-20 sm:rounded-md'>
            <h3 className='font-medium text-xl text-center'>Short any long URL for Free</h3>
            <LongURLInput />
          </div>
        </div>
        {/*Description section*/}
        <div className='flex flex-row min-w-full mt-16 p-4 justify-around'>
          <div className='flex flex-col flex-wrap basis-1/3 justify-center p-3'>
            <h1 className='ms-4'>Header</h1>
            <hr className='block border-b-2 border-t-neutral-100 max-w-full' />
            <p>
              Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the
              industrys standard dummy text ever since the 1500s, when an unknown printer took a galley of type and
              scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into
              electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release
              of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software
              like Aldus PageMaker including versions of Lorem Ipsum.
            </p>
          </div>
          <div className='flex flex-wrap basis-1/3 justify-center'>B</div>
          <div className='flex flex-wrap basis-1/3 justify-center'>C</div>
        </div>
      </div>
    </main>
  );
}

import LongURLInput from "@/components/LongURLInput";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main>
      <div>
        {/*Main URL input layout */}
        <div className="inline-block w-full border-b-2 border-slate-300 bg-slate-100 shadow-md">
          <div className="mx-auto max-w-2xl sm:mt-14 ">
            <div className="p-4 pb-14  max-sm:pt-28 ">
              <h3 className="text-center text-xl font-bold text-gray-900">Short any long URL for Free</h3>
              <LongURLInput />
            </div>
          </div>
        </div>
        {/*Description section */}
        <div className="mb-3 mt-14 flex min-w-full flex-row justify-evenly p-4 max-lg:flex-col">
          <div className="my-3 flex basis-1/4 flex-col flex-wrap rounded-lg border border-gray-200 p-6 shadow">
            <div className="flex flex-row justify-center">
              <Image className="h-14" src="/icons/share_link_undraw.svg" width={56} height={56} alt="Link share logo" />
              <span className="ml-3 flex flex-1 flex-col justify-center">
                <h5 className="text-2xl font-bold tracking-tight text-gray-900">What is ShortLi?</h5>
              </span>
            </div>
            <hr className="border-b-1 my-3 block max-w-full border-t-neutral-200" />
            <p className="mb-3 font-normal text-gray-700">
              ShortLi is an easy to use Free web link shortener tool.
              <span className="mb-2 block" />
              Create <span className="font-bold">short links, QR codes and custom Link-in-bio pages</span> with
              trackable statistics.
            </p>
          </div>
          <div className="my-3 flex basis-1/4 flex-col flex-wrap rounded-lg border border-gray-200 p-6 shadow">
            <div className="flex flex-row justify-center">
              <Image
                className="h-14"
                src="/icons/expiry_time_undraw.svg"
                width={56}
                height={56}
                alt="Expiry time logo"
              />
              <span className="ml-3 flex flex-1 flex-col justify-center">
                <h5 className="text-2xl font-bold tracking-tight text-gray-900">Default Link Expiry Time</h5>
              </span>
            </div>
            <hr className="border-b-1 my-3 block max-w-full border-t-neutral-200" />
            <p className="mb-3 font-normal text-gray-700">
              By default the links expire after <span className="font-bold">180</span> days.
              <span className="mb-2 block" />
              Unlock full control and access a range of exciting additional features with just a quick and easy
              registration.
            </p>
          </div>
          <div className="my-3 flex basis-1/4 flex-col flex-wrap rounded-lg border border-gray-200 p-6 shadow">
            <div className="flex flex-row justify-center">
              <Image className="h-14" src="/icons/charts_undraw.svg" width={56} height={56} alt="Expiry time logo" />
              <span className="ml-3 flex flex-1 flex-col justify-center">
                <h5 className="text-2xl font-bold tracking-tight text-gray-900">Redirection statistics</h5>
              </span>
            </div>

            <hr className="border-b-1 my-3 block max-w-full border-t-neutral-200" />
            <p className="mb-3 font-normal text-gray-700">
              Track the performance of your shortened links in real-time.
              <span className="mb-2 block" />
              Monitor key metrics such as click-through rates, geographic locations of visitors, and device types used
              to access your links.
            </p>
          </div>
        </div>
      </div>
      <div className="text-gray-600 max-lg:mx-6 max-lg:mb-8 max-lg:flex max-lg:justify-end lg:fixed lg:bottom-5 lg:right-5">
        <Link className="text-sm" href="/termsofuse">
          Terms Of Use
        </Link>
      </div>
    </main>
  );
}

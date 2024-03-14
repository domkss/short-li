import Image from "next/image";

type ConfirmationViewProps = {
  title: string;
  detailedMessage: string;
  cancelButtonText?: string;
  proccedButtonText: string;
  iconSrc?: string;
  onCancel: () => void;
  onProceed: () => void;
};

export default function ConfirmationView(props: ConfirmationViewProps) {
  return (
    <div className="confirm-dialog fixed inset-0 z-50 flex items-center justify-center backdrop-blur ">
      <div className="relative min-h-screen px-4 md:flex md:items-center md:justify-center">
        <div className="absolute inset-0 z-10 h-full w-full opacity-25"></div>
        <div className="fixed inset-x-0 bottom-0 z-50 mx-4 mb-4 rounded-lg bg-white p-4 shadow-lg md:relative md:mx-auto md:max-w-md">
          <div className="items-center md:flex">
            {props.iconSrc ? (
              <div className="mx-auto flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full border border-gray-300">
                <Image src={props.iconSrc} width={55} height={55} alt="Delete icon" />
              </div>
            ) : null}
            <div className="mt-4 text-center md:ml-6 md:mt-0 md:text-left">
              <p className="font-bold">{props.title}</p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700">{props.detailedMessage}</p>
            </div>
          </div>
          <div className="mt-4 text-center md:flex md:justify-end md:text-right">
            <button
              className="block w-full rounded-lg bg-red-200 px-4 py-3 text-sm font-semibold text-red-700 md:order-2 md:ml-2 md:inline-block md:w-auto md:py-2"
              onClick={props.onProceed}
            >
              {props.proccedButtonText}
            </button>
            <button
              className="mt-4 block w-full rounded-lg bg-gray-200 px-4 py-3 text-sm font-semibold md:order-1 md:mt-0 md:inline-block md:w-auto md:py-2"
              onClick={props.onCancel}
            >
              {props.cancelButtonText ? props.cancelButtonText : "Cancel"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import OrderableListLayout, { KeyedReactElement } from "@/components/atomic/OrderableListLayout";
import { LinkInBioButtonItem, LinkInBioPatchSchema } from "@/lib/common/Types";
import { cn } from "@/lib/client/uiHelperFunctions";
import Image from "next/image";
import copyToClypboard from "copy-to-clipboard";
import { useRouter } from "next/navigation";

type LinkTreeViewProps = {
  bioPageUrl?: string;
  btnList: LinkInBioButtonItem[];
  setBtnList?: (btnList: LinkInBioButtonItem[]) => void;
  patchBioButtonList?: (btnList: LinkInBioButtonItem[]) => void;

  descriptionText: string;
  setDescriptionText?: (value: string) => void;
  patchBioDescription?: (value: string) => void;

  onDragEnd?: (result: any) => void;

  immutableView?: boolean;
};

export default function LinkTreeView(props: LinkTreeViewProps) {
  const router = useRouter();

  return (
    <div>
      <div className="m2-4 flex justify-center">
        <div
          className="cursor-pointer rounded bg-purple-300 p-2 text-sm shadow-sm"
          onClick={() => {
            if (props.bioPageUrl) copyToClypboard(props.bioPageUrl);
          }}
        >
          {props.bioPageUrl}
        </div>
      </div>
      <div className="flex justify-center p-4">
        <Image
          className="h-20 w-20 rounded-full p-1 ring-2 ring-gray-300"
          src="/temp_profilepic.jpg"
          alt="Bordered avatar"
          width={80}
          height={80}
          priority
        />
      </div>

      <div className="mb-2 flex justify-center">
        <textarea
          disabled={props.immutableView}
          value={props.descriptionText}
          onChange={(e) => {
            props.patchBioDescription?.(e.target.value);
            props.setDescriptionText?.(e.target.value);
          }}
          className={cn(
            "min-w-xl basis-full rounded-md border border-gray-500 p-1 text-center text-gray-800 md:basis-2/3 xl:basis-1/3",
            {
              "pointer-events-none cursor-default resize-none border-none bg-transparent": props.immutableView,
            },
          )}
        />
      </div>
      <div className="flex justify-center">
        <OrderableListLayout
          className="flex basis-full flex-col md:basis-2/3 xl:basis-1/3"
          onDragEnd={props.onDragEnd ? props.onDragEnd : () => {}}
          isDragDisabled={props.immutableView}
        >
          {props.btnList &&
            props.btnList.map(
              (item, key) =>
                (
                  <div
                    key={key}
                    id={item.id.toString()}
                    style={{ backgroundColor: item.bgColor }}
                    onClick={() => (props.immutableView ? router.push(item.url) : window.open(item.url, "_blank"))}
                    className="mt-2 flex cursor-pointer select-none rounded-md border border-gray-300 px-5 py-3 shadow-sm"
                  >
                    <div className="flex-1">
                      <button
                        id="delet-link-button"
                        className={cn("mx-2", { hidden: props.immutableView })}
                        onClick={(event) => {
                          event.stopPropagation();
                          let newBtnList = props.btnList.filter((i) => i.id != item.id);
                          props.patchBioButtonList?.(newBtnList);
                          props.setBtnList?.(newBtnList);
                        }}
                      >
                        <Image src="/icons/delete_icon.svg" width={25} height={25} alt="Edit pencil icon" />
                      </button>
                    </div>
                    <div className="text-center">{item.text}</div>
                    <div className="flex-1"></div>
                  </div>
                ) as KeyedReactElement,
            )}
        </OrderableListLayout>
      </div>
    </div>
  );
}

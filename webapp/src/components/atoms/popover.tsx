import {
  useMergeRefs,
  FloatingFocusManager,
  Placement,
} from "@floating-ui/react";
import {
  useState,
  useRef,
  isValidElement,
  useMemo,
  cloneElement,
  Dispatch,
  SetStateAction,
} from "react";
import { getTheme } from "flowbite-react";
import {
  useFloating,
  autoUpdate,
  useInteractions,
  useClick,
  useHover,
  useFocus,
  safePolygon,
  useDismiss,
  useRole,
} from "@floating-ui/react";
import { offset, autoPlacement, flip, shift, arrow } from "@floating-ui/react";

const getMiddleware = ({
  arrowRef,
  placement,
}: {
  arrowRef: React.RefObject<Element>;
  placement: Placement | "auto";
}) => {
  const middleware = [];
  middleware.push(offset(8));
  middleware.push(placement === "auto" ? autoPlacement() : flip());
  middleware.push(shift({ padding: 8 }));
  if (arrowRef?.current) {
    middleware.push(arrow({ element: arrowRef.current }));
  }
  return middleware;
};

const getPlacement = ({ placement }: { placement: Placement | "auto" }) => {
  return placement === "auto" ? void 0 : placement;
};

const useBaseFLoating = ({
  open,
  arrowRef,
  placement = "top",
  setOpen,
}: {
  open: boolean;
  arrowRef: React.RefObject<Element>;
  placement: Placement | "auto";
  setOpen: Dispatch<SetStateAction<boolean>>;
}) => {
  return useFloating({
    placement: getPlacement({ placement }),
    open,
    onOpenChange: setOpen,
    whileElementsMounted: autoUpdate,
    middleware: getMiddleware({ placement, arrowRef }),
  });
};

const getArrowPlacement = ({ placement }: { placement: Placement }) => {
  return (
    {
      top: "bottom",
      right: "left",
      bottom: "top",
      left: "right",
    }[placement.split("-")[0]] || "top"
  );
};

type Trigger = "hover" | "click" | "focus";
interface PopoverProps
  extends Omit<React.ComponentProps<"div">, "content" | "style"> {
  arrow?: boolean;
  content: React.ReactNode;
  placement?: "auto" | Placement;
  autoFocus?: boolean;
  /**
   * Trigger for the popover
   * - `click`: Show the content on click the child element
   * - `hover`: Show the content on mouse enter the child element
   * - `focus`: Show the content on focus the child element
   */
  trigger?: Trigger | Trigger[];
  /**
   * Whether to allow the popover to close directly on event canceled on the children even if the content is focussed.
   */
  hardClose?: boolean;
  initialOpen?: boolean;
  children: React.FunctionComponentElement<Element>;
  open?: boolean;
  onOpenChange?: Dispatch<SetStateAction<boolean>>;
}

const isFocusTrigger = (trigger: Trigger | Trigger[]) => {
  return (
    trigger === "focus" ||
    (trigger instanceof Array && trigger.includes("focus"))
  );
};

const isHoverTrigger = (trigger: Trigger | Trigger[]) => {
  return (
    trigger === "hover" ||
    (trigger instanceof Array && trigger.includes("hover"))
  );
};
const isClickTrigger = (trigger: Trigger | Trigger[]) => {
  return (
    trigger === "click" ||
    (trigger instanceof Array && trigger.includes("click"))
  );
};

export const CustomPopover: React.FC<PopoverProps> = ({
  children,
  content,
  arrow = true,
  trigger = "click",
  autoFocus = true,
  hardClose = false,
  initialOpen,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  placement: theirPlacement = "bottom",
  ...props
}) => {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(
    Boolean(initialOpen),
  );
  const arrowRef = useRef(null);
  const theme = getTheme().popover;
  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = setControlledOpen ?? setUncontrolledOpen;
  const floatingProps = useBaseFLoating({
    open,
    placement: theirPlacement,
    arrowRef,
    setOpen,
  });
  const {
    floatingStyles,
    context,
    placement,
    middlewareData: { arrow: { x: arrowX, y: arrowY } = {} },
    refs,
  } = floatingProps;
  const { getFloatingProps, getReferenceProps } = useInteractions([
    useClick(context, {
      enabled: isClickTrigger(trigger),
    }),
    useHover(context, {
      enabled: isHoverTrigger(trigger),
      handleClose: hardClose ? null : safePolygon(),
    }),
    useFocus(context, {
      enabled: isFocusTrigger(trigger),
      visibleOnly: true,
    }),
    useDismiss(context),
    useRole(context, { role: "dialog" }),
  ]);
  const childrenRef = children.ref;
  const ref = useMergeRefs([context.refs.setReference, childrenRef]);
  if (!isValidElement(children)) {
    throw Error("Invalid target element");
  }
  const target = useMemo(() => {
    return cloneElement(
      children,
      getReferenceProps({
        ref,
        ...children?.props,
      } as unknown as React.HTMLProps<Element>),
    );
  }, [children, ref, getReferenceProps]);

  return (
    <>
      {target}
      {open && (
        <FloatingFocusManager
          context={context}
          modal={true}
          disabled={!autoFocus}
        >
          <div
            className={theme.base}
            ref={refs.setFloating}
            {...props}
            style={floatingStyles}
            {...getFloatingProps()}
          >
            <div className="relative">
              {arrow && (
                <div
                  className={theme.arrow.base}
                  ref={arrowRef}
                  style={{
                    top: arrowY ?? " ",
                    left: arrowX ?? " ",
                    right: " ",
                    bottom: " ",
                    [getArrowPlacement({ placement })]: theme.arrow.placement,
                  }}
                />
              )}
              {content}
            </div>
          </div>
        </FloatingFocusManager>
      )}
    </>
  );
};

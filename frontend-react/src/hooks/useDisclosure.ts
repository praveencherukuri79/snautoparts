import { useState, useCallback } from 'react';

export interface UseDisclosureReturn {
  /** Whether the disclosure is open */
  isOpen: boolean;
  /** Open the disclosure */
  open: () => void;
  /** Close the disclosure */
  close: () => void;
  /** Toggle the disclosure */
  toggle: () => void;
  /** Set open state directly */
  setIsOpen: (isOpen: boolean) => void;
}

/**
 * useDisclosure Hook
 * 
 * Manages open/close state for modals, drawers, dropdowns, etc.
 * 
 * @param defaultOpen - Initial open state
 * 
 * @example
 * ```tsx
 * const { isOpen, open, close } = useDisclosure();
 * 
 * return (
 *   <>
 *     <Button onClick={open}>Open Modal</Button>
 *     <Modal open={isOpen} onClose={close}>
 *       Content here
 *     </Modal>
 *   </>
 * );
 * ```
 */
export function useDisclosure(defaultOpen: boolean = false): UseDisclosureReturn {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  return {
    isOpen,
    open,
    close,
    toggle,
    setIsOpen,
  };
}

export default useDisclosure;

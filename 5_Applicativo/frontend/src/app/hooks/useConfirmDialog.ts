import { useState } from "react";

interface ConfirmState<T> {
  data: T | null;
  isOpen: boolean;
}

export function useConfirmDialog<T>() {
  const [state, setState] = useState<ConfirmState<T>>({ data: null, isOpen: false });

  const open = (data: T) => setState({ data, isOpen: true });
  const close = () => setState({ data: null, isOpen: false });

  return { isOpen: state.isOpen, data: state.data, open, close };
}
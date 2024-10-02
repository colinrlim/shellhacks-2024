// @/store/types
import { RootState, AppDispatch } from "./index";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";

// Custom hooks with types
export const useAppDispatchTyped: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

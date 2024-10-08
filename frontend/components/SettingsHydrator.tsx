// @/components/SettingsHydrator

import { useEffect } from "react";
import { useAppSelector } from "@/store/types";
import { useAppDispatch } from "@/store";
import { hydrateSettings } from "@/store/slices/settingsSlice";

export const SettingsHydrator: React.FC = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user.userInfo);
  const settingsHydrated = useAppSelector((state) => state.settings.hydrated);

  useEffect(() => {
    if (user?.auth0Id && !settingsHydrated) {
      dispatch(hydrateSettings(user.auth0Id));
    }
  }, [user, settingsHydrated, dispatch]);

  return null;
};

export default SettingsHydrator;

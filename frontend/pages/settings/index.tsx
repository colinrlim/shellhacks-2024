import React, { useState, useEffect } from "react";
import { useAppSelector } from "@/store/types";
import { useAppDispatch } from "@/store";
import { updateSettings, fetchSettings } from "@/store/slices/settingsSlice";
import { motion, AnimatePresence } from "framer-motion";
import { Search, User, Shield, Palette, Layers, Box, Save } from "lucide-react";
import { useRouter } from "next/router";
import { ToggleSwitch, SelectMenu } from "@/components/SettingsComponents";
import { withProtected } from "@/hoc";
import Logger from "@/utils/logger";

// Feature flags
const FEATURE_FLAGS = {
  MFA: process.env.NEXT_PUBLIC_FEATURE_MFA === "true",
  DATA_EXPORT: process.env.NEXT_PUBLIC_FEATURE_DATA_EXPORT === "true",
  DELETE_ACCOUNT: process.env.NEXT_PUBLIC_FEATURE_DELETE_ACCOUNT === "true",
  CHANGE_PASSWORD: process.env.NEXT_PUBLIC_FEATURE_CHANGE_PASSWORD === "true",
  FONT_SIZE: process.env.NEXT_PUBLIC_FEATURE_FONT_SIZE === "true",
};

const Settings = () => {
  const dispatch = useAppDispatch();
  const settings = useAppSelector((state) => state.settings);
  const user = useAppSelector((state) => state.user.userInfo);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  const [activeSection, setActiveSection] = useState("account");
  const [localSettings, setLocalSettings] = useState(settings);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (mounted && user?.auth0Id) {
      Logger.info(`Fetching settings for user ${user.auth0Id}`);
      dispatch(fetchSettings(user.auth0Id));
    } else if (mounted && !user) {
      Logger.warn("User not found, redirecting to home");
      router.push("/");
    }
  }, [mounted, user, dispatch, router]);

  useEffect(() => {
    Logger.debug("Settings updated:", settings);
    setLocalSettings(settings);
  }, [settings]);

  const handleSettingChange = (section: string, key: string, value: any) => {
    Logger.debug(`Setting changed: ${section}.${key} = ${value}`);
    setLocalSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }));
    setHasChanges(true);
  };

  const saveSettings = () => {
    if (!user?.auth0Id) {
      Logger.error("Cannot save settings: User ID not found");
      return;
    }
    Logger.info(`Saving settings for user ${user.auth0Id}`);
    dispatch(updateSettings({ userId: user.auth0Id, settings: localSettings }));
    setHasChanges(false);
  };

  const renderSection = (section: string) => {
    switch (section) {
      case "account":
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <h2 className="text-xl font-semibold mb-4">Account Settings</h2>
            <div className="space-y-6">
              <SettingItem
                label="Name"
                description="Your full name as it appears on your account."
                input={
                  <input
                    type="text"
                    value={localSettings.account?.name || ""}
                    onChange={(e) =>
                      handleSettingChange("account", "name", e.target.value)
                    }
                    className="relative w-full cursor-default rounded-md bg-gray-300 py-2 pl-3 pr-10 text-left border border-gray-500 focus:outline-none focus-visible:border-gray-800 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-300 sm:text-sm"
                  />
                }
              />
              <SettingItem
                label="Email"
                description="The email address associated with your account."
                input={
                  <input
                    type="email"
                    value={localSettings.account?.email || ""}
                    disabled
                    className="relative w-full rounded-md bg-gray-300 py-2 pl-3 pr-10 text-left border border-gray-500 focus:outline-none focus-visible:border-gray-800 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-300 sm:text-sm cursor-not-allowed"
                  />
                }
              />
            </div>
          </motion.div>
        );
      case "security":
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <h2 className="text-xl font-semibold mb-4">Security</h2>
            <div className="space-y-6">
              {FEATURE_FLAGS.MFA && (
                <SettingItem
                  label="Two-Factor Authentication"
                  description="Enable an extra layer of security for your account."
                  input={
                    <ToggleSwitch
                      enabled={
                        localSettings.security?.twoFactorEnabled || false
                      }
                      setEnabled={(value) =>
                        handleSettingChange(
                          "security",
                          "twoFactorEnabled",
                          value
                        )
                      }
                      label="Enable Two-Factor Authentication"
                    />
                  }
                />
              )}
              {FEATURE_FLAGS.CHANGE_PASSWORD && (
                <SettingItem
                  label="Change Password"
                  description="Update your account password for better security."
                  input={
                    <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                      Change Password
                    </button>
                  }
                />
              )}
            </div>
          </motion.div>
        );
      case "interface":
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <h2 className="text-xl font-semibold mb-4">Interface Settings</h2>
            <div className="space-y-6">
              <SettingItem
                label="Theme"
                description="Choose between light and dark mode for the application."
                input={
                  <SelectMenu
                    value={localSettings.interface?.theme || "light"}
                    onChange={(value) =>
                      handleSettingChange("interface", "theme", value)
                    }
                    options={["light", "dark"]}
                  />
                }
              />
              {FEATURE_FLAGS.FONT_SIZE && (
                <SettingItem
                  label="Font Size"
                  description="Adjust the font size for better readability."
                  input={
                    <SelectMenu
                      value={localSettings.interface?.fontSize || "medium"}
                      onChange={(value) =>
                        handleSettingChange("interface", "fontSize", value)
                      }
                      options={["small", "medium", "large"]}
                    />
                  }
                />
              )}
            </div>
          </motion.div>
        );
      case "data":
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <h2 className="text-xl font-semibold mb-4">Account Data</h2>
            <div className="space-y-6">
              {FEATURE_FLAGS.DATA_EXPORT && (
                <SettingItem
                  label="Export Data"
                  description="Download a copy of your account data."
                  input={
                    <button
                      onClick={() =>
                        handleSettingChange("data", "dataExportRequested", true)
                      }
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Request Data Export
                    </button>
                  }
                />
              )}
              {FEATURE_FLAGS.DELETE_ACCOUNT && (
                <SettingItem
                  label="Delete Account"
                  description="Permanently delete your account and all associated data."
                  input={
                    <button className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                      Delete Account
                    </button>
                  }
                />
              )}
            </div>
          </motion.div>
        );
      case "legal":
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <h2 className="text-xl font-semibold mb-4">Legal</h2>
            <div className="space-y-6">
              <SettingItem
                label="Marketing Consent"
                description="Choose whether to receive marketing emails from us."
                input={
                  <ToggleSwitch
                    enabled={localSettings.legal?.marketingConsent || false}
                    setEnabled={(value) =>
                      handleSettingChange("legal", "marketingConsent", value)
                    }
                    label="Receive marketing emails"
                  />
                }
              />
              <SettingItem
                label="Terms of Service"
                description="Read our terms of service agreement."
                input={
                  <a
                    href="/learn/legal/tos"
                    className="text-indigo-600 hover:text-indigo-800"
                  >
                    View Terms of Service
                  </a>
                }
              />
              <SettingItem
                label="Privacy Policy"
                description="Read our privacy policy."
                input={
                  <a
                    href="/learn/legal/privacy"
                    className="text-indigo-600 hover:text-indigo-800"
                  >
                    View Privacy Policy
                  </a>
                }
              />
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  const sectionItems = [
    { id: "account", icon: User, label: "Account Settings", disabled: false },
    {
      id: "security",
      icon: Shield,
      label: "Security",
      disabled:
        process.env.NEXT_PUBLIC_FEATURE_SECURITY === "false" ? true : false,
    },
    {
      id: "interface",
      icon: Palette,
      label: "Interface Settings",
      disabled: false,
    },
    {
      id: "data",
      icon: Layers,
      label: "Account Data",
      disabled:
        process.env.NEXT_PUBLIC_FEATURE_ACCOUNTDATA === "false" ? true : false,
    },
    { id: "legal", icon: Box, label: "Legal", disabled: false },
  ];

  const searchEnabled = process.env.NEXT_PUBLIC_FEATURE_SEARCH === "true";

  console.log(sectionItems, process.env.NEXT_PUBLIC_FEATURE_SECURITY);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <motion.div
        initial={{ x: -250 }}
        animate={{ x: 0 }}
        exit={{ x: -250 }}
        transition={{ duration: 0.25 }}
        className="w-64 bg-gray-900 text-white p-4"
      >
        <h1 className="text-2xl font-bold mb-6">Settings</h1>
        {searchEnabled && (
          <div className="mb-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search"
                className="w-full bg-gray-800 text-white rounded-md py-2 pl-8 pr-4"
              />
              <Search className="absolute left-2 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>
        )}
        <nav>
          {sectionItems.map(
            (item) =>
              !item.disabled && (
                <motion.button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`flex items-center w-full p-2 rounded-md mb-2 ${
                    activeSection === item.id
                      ? "bg-gray-800"
                      : "hover:bg-gray-800"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.label} {item.disabled}
                </motion.button>
              )
          )}
        </nav>
      </motion.div>
      <main className="flex-1 p-8 m-8">
        <AnimatePresence mode="wait">
          {renderSection(activeSection)}
        </AnimatePresence>
        <AnimatePresence>
          {hasChanges && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ duration: 0.15 }}
              className="fixed bottom-8 right-8"
            >
              <button
                onClick={saveSettings}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 flex items-center"
              >
                <Save className="h-5 w-5 mr-2" />
                Save Changes
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

interface SettingItemProps {
  label: string;
  description: string;
  input: string;
}

const SettingItem = ({ label, description, input }: SettingItemProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 20 }}
    transition={{ duration: 0.25 }}
    className="bg-white p-6 rounded-lg shadow-md mb-6"
  >
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <p className="text-sm text-gray-500 mb-4">{description}</p>
    <div className="mt-2">{input}</div>
  </motion.div>
);

export default withProtected(Settings);

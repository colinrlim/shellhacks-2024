import React, { useState, useEffect } from "react";
import { useAppSelector } from "@/store/types";
import { useAppDispatch } from "@/store";
import { updateSettings, fetchSettings } from "@/store/slices/settingsSlice";
import { motion, AnimatePresence } from "framer-motion";
import { Search, User, Shield, Palette, Layers, Box, Save } from "lucide-react";
import { useRouter } from "next/router";
import { ToggleSwitch, SelectMenu } from "@/components/SettingsComponents";

const Settings = () => {
  const dispatch = useAppDispatch();
  const settings = useAppSelector((state) => state.settings);
  const user = useAppSelector((state) => state.user.userInfo);
  const sessionId = useAppSelector((state) => state.user.sessionId);
  const currentTopic = useAppSelector((state) => state.knowledge.currentTopic);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  const [activeSection, setActiveSection] = useState("account");
  const [localSettings, setLocalSettings] = useState(settings);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (mounted && !user) {
      router.push("/");
    }
  }, [mounted, currentTopic, user, router, sessionId]);

  useEffect(() => {
    if (user) {
      dispatch(fetchSettings(user.auth0Id));
    }
  }, [dispatch, user]);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleSettingChange = (section: string, key: string, value: any) => {
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
    dispatch(
      updateSettings({ userId: user?.auth0Id || "", settings: localSettings })
    );
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
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-xl font-semibold mb-4">Account Settings</h2>
            <div className="space-y-6">
              <SettingItem
                label="Name"
                description="Your full name as it appears on your account."
                input={
                  <input
                    type="text"
                    value={localSettings.account.name || ""}
                    onChange={(e) =>
                      handleSettingChange("account", "name", e.target.value)
                    }
                    className="mt-1 block w-full rounded-md bg-gray-300 border-gray-500 shadow-sm focus:border-gray-800 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 px-2"
                  />
                }
              />
              <SettingItem
                label="Email"
                description="The email address associated with your account."
                input={
                  <input
                    type="email"
                    value={localSettings.account.email}
                    onChange={(e) =>
                      handleSettingChange("account", "email", e.target.value)
                    }
                    className="mt-1 block w-full rounded-md border-gray-500 bg-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
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
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-xl font-semibold mb-4">Security</h2>
            <div className="space-y-6">
              <SettingItem
                label="Two-Factor Authentication"
                description="Enable an extra layer of security for your account."
                input={
                  <ToggleSwitch
                    enabled={localSettings.security.twoFactorEnabled}
                    setEnabled={(value) =>
                      handleSettingChange("security", "twoFactorEnabled", value)
                    }
                    label="Enable Two-Factor Authentication"
                  />
                }
              />
              <SettingItem
                label="Change Password"
                description="Update your account password for better security."
                input={
                  <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    Change Password
                  </button>
                }
              />
            </div>
          </motion.div>
        );
      case "interface":
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-xl font-semibold mb-4">Interface Settings</h2>
            <div className="space-y-6">
              <SettingItem
                label="Theme"
                description="Choose between light and dark mode for the application."
                input={
                  <SelectMenu
                    value={localSettings.interface.theme}
                    onChange={(value) =>
                      handleSettingChange("interface", "theme", value)
                    }
                    options={["light", "dark"]}
                    label="Theme"
                  />
                }
              />
              <SettingItem
                label="Font Size"
                description="Adjust the font size for better readability."
                input={
                  <SelectMenu
                    value={localSettings.interface.fontSize}
                    onChange={(value) =>
                      handleSettingChange("interface", "fontSize", value)
                    }
                    options={["small", "medium", "large"]}
                    label="Font Size"
                  />
                }
              />
            </div>
          </motion.div>
        );
      case "data":
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-xl font-semibold mb-4">Account Data</h2>
            <div className="space-y-6">
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
              <SettingItem
                label="Delete Account"
                description="Permanently delete your account and all associated data."
                input={
                  <button className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                    Delete Account
                  </button>
                }
              />
            </div>
          </motion.div>
        );
      case "legal":
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-xl font-semibold mb-4">Legal</h2>
            <div className="space-y-6">
              <SettingItem
                label="Marketing Consent"
                description="Choose whether to receive marketing emails from us."
                input={
                  <ToggleSwitch
                    enabled={localSettings.legal.marketingConsent}
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
                    href="/terms"
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
                    href="/privacy"
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
    { id: "account", icon: User, label: "Account Settings" },
    { id: "security", icon: Shield, label: "Security" },
    { id: "interface", icon: Palette, label: "Interface Settings" },
    { id: "data", icon: Layers, label: "Account Data" },
    { id: "legal", icon: Box, label: "Legal" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      <motion.div
        initial={{ x: -250 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.5 }}
        className="w-64 bg-gray-900 text-white p-4"
      >
        <h1 className="text-2xl font-bold mb-6">Settings</h1>
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
        <nav>
          {sectionItems.map((item) => (
            <motion.button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`flex items-center w-full p-2 rounded-md mb-2 ${
                activeSection === item.id ? "bg-gray-800" : "hover:bg-gray-800"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <item.icon className="h-5 w-5 mr-3" />
              {item.label}
            </motion.button>
          ))}
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
              transition={{ duration: 0.3 }}
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

const SettingItem = ({ label, description, input }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="bg-white p-6 rounded-lg shadow-md mb-6"
  >
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <p className="text-sm text-gray-500 mb-4">{description}</p>
    <div className="mt-2">{input}</div>
  </motion.div>
);

export default Settings;

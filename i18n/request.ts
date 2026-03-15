// i18n/request.ts
import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";
import { mergeFeatureMessages } from "@mohasinac/cli/i18n";
import features from "../features.config";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  // Deep-merges @mohasinac/feat-* message fragments for enabled features.
  // Local messages/ files (above) always win over package defaults.
  const messages = await mergeFeatureMessages(locale, features);

  return {
    locale,
    messages,
    onError() {},
    getMessageFallback() {
      return "";
    },
  };
});

import type {RemoteConfigTemplate} from "firebase-admin/remote-config";

export default {
  conditions: [],
  parameters: {
    can_show_preview_landing_page: {
      defaultValue: {
        value: "false",
      },
      description:
        "Boolean used to enable or disable the preview landing page.",
      valueType: "BOOLEAN",
    },
    order_form_type: {
      defaultValue: {
        value: "manual",
      },
      description: `String used to determine the type of order form to display. 
        Possible values are 'manual', 'ai-assisted', and 'multiple'.`,
      valueType: "STRING",
    },
  },
  parameterGroups: {},
  etag: "",
  version: {},
} satisfies RemoteConfigTemplate;

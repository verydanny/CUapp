import { type CollectionCreate } from "appwrite-utils";
  
  const dingusConfig: Partial<CollectionCreate> = {
    name: "dingus",
    $id: "67b3289c002adaaa8dc1",
    enabled: true,
    documentSecurity: false,
    $permissions: [
      
    ],
    attributes: [
      { key: "home", type: "string", error: "", required: false, array: false, size: 32 }
    ],
    indexes: [
      
    ]
  };
  
  export default dingusConfig;
  
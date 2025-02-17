import { type CollectionCreate } from "appwrite-utils";
  
  const profilesConfig: Partial<CollectionCreate> = {
    name: "profiles",
    $id: "new-profiles",
    enabled: true,
    documentSecurity: false,
    $permissions: [
      
    ],
    attributes: [
      { key: "username", type: "string", error: "", required: false, array: false, size: 32 }
    ],
    indexes: [
      
    ]
  };
  
  export default profilesConfig;
  
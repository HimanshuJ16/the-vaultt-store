import { Collection } from "../types";

export const mockCollections: Collection[] = [
  {
    handle: "joyco-root",
    title: "Joyco root catalog",
    description: "",
    seo: {
      title: "",
      description: "",
    },
    parentCategoryTree: [],
    updatedAt: "",
    path: "/search",
  },
  {
    handle: "lamps",
    title: "Lamps",
    description: "",
    seo: {
      title: "",
      description: "",
    },
    parentCategoryTree: [
      {
        id: "joyco-root",
        name: "Joyco root catalog",
      },
      {
        id: "lamps",
        name: "Lamps",
      },
    ],
    updatedAt: "",
    path: "/search/lamps",
  },
  {
    handle: "miscellaneous",
    title: "Miscellaneous",
    description: "",
    seo: {
      title: "",
      description: "",
    },
    parentCategoryTree: [
      {
        id: "joyco-root",
        name: "Joyco root catalog",
      },
      {
        id: "miscellaneous",
        name: "Miscellaneous",
      },
    ],
    updatedAt: "",
    path: "/search/miscellaneous",
  },
  {
    handle: "pillows",
    title: "Pillows",
    description: "",
    seo: {
      title: "",
      description: "",
    },
    parentCategoryTree: [
      {
        id: "joyco-root",
        name: "Joyco root catalog",
      },
      {
        id: "pillows",
        name: "Pillows",
      },
    ],
    updatedAt: "",
    path: "/search/pillows",
  },
  {
    handle: "rugs",
    title: "Rugs",
    description: "",
    seo: {
      title: "",
      description: "",
    },
    parentCategoryTree: [
      {
        id: "joyco-root",
        name: "Joyco root catalog",
      },
      {
        id: "rugs",
        name: "Rugs",
      },
    ],
    updatedAt: "",
    path: "/search/rugs",
  },
  {
    handle: "seats",
    title: "Seats",
    description: "",
    seo: {
      title: "",
      description: "",
    },
    parentCategoryTree: [
      {
        id: "joyco-root",
        name: "Joyco root catalog",
      },
      {
        id: "seats",
        name: "Seats",
      },
    ],
    updatedAt: "",
    path: "/search/seats",
  },
  {
    handle: "featured",
    title: "Featured",
    description: "",
    seo: {
      title: "",
      description: "",
    },
    parentCategoryTree: [
      {
        id: "joyco-root",
        name: "Joyco root catalog",
      },
      {
        id: "featured",
        name: "Featured",
      },
    ],
    updatedAt: "",
    path: "/search/featured",
  },
  {
    handle: "top-seller",
    title: "Top Seller",
    description: "",
    seo: {
      title: "",
      description: "",
    },
    parentCategoryTree: [
      {
        id: "joyco-root",
        name: "Joyco root catalog",
      },
      {
        id: "top-seller",
        name: "Top Seller",
      },
    ],
    updatedAt: "",
    path: "/search/top-seller",
  },
];

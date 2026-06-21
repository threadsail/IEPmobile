import type { MetadataRoute } from "next";

type ChangeFrequency = NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>;

export type PublicPage = {
  path: string;
  priority: number;
  changeFrequency: ChangeFrequency;
  llms: {
    title: string;
    description: string;
    section: "Overview" | "Features" | "Company" | "Optional";
  };
};

/** Public marketing and info pages included in sitemap.xml and llms.txt. */
export const PUBLIC_PAGES: PublicPage[] = [
  {
    path: "/",
    priority: 1,
    changeFrequency: "weekly",
    llms: {
      title: "Home",
      description: "Product overview, value props, and sign-up links",
      section: "Overview",
    },
  },
  {
    path: "/pricing",
    priority: 0.9,
    changeFrequency: "monthly",
    llms: {
      title: "Pricing",
      description: "Subscription plans and billing options",
      section: "Overview",
    },
  },
  {
    path: "/auth",
    priority: 0.8,
    changeFrequency: "monthly",
    llms: {
      title: "Sign in",
      description: "Create an account or log in with Google or Microsoft",
      section: "Overview",
    },
  },
  {
    path: "/features/schedule",
    priority: 0.8,
    changeFrequency: "monthly",
    llms: {
      title: "Schedule",
      description: "Daily and weekly schedule views aligned with IEP service minutes",
      section: "Features",
    },
  },
  {
    path: "/features/data",
    priority: 0.8,
    changeFrequency: "monthly",
    llms: {
      title: "Data",
      description: "Student progress notes, observations, and reporting",
      section: "Features",
    },
  },
  {
    path: "/features/activities",
    priority: 0.8,
    changeFrequency: "monthly",
    llms: {
      title: "Activities",
      description: "Assign and track activities tied to IEP goals",
      section: "Features",
    },
  },
  {
    path: "/features/students",
    priority: 0.8,
    changeFrequency: "monthly",
    llms: {
      title: "Students",
      description: "Student roster, profiles, and IEP goal management",
      section: "Features",
    },
  },
  {
    path: "/info/about",
    priority: 0.7,
    changeFrequency: "monthly",
    llms: {
      title: "About",
      description: "Company background and the team behind IEP Classroom",
      section: "Company",
    },
  },
  {
    path: "/info/support",
    priority: 0.6,
    changeFrequency: "monthly",
    llms: {
      title: "Support",
      description: "Help requests and support contact",
      section: "Company",
    },
  },
  {
    path: "/info/contact",
    priority: 0.6,
    changeFrequency: "monthly",
    llms: {
      title: "Contact",
      description: "General contact information",
      section: "Company",
    },
  },
];

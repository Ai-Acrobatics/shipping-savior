import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { User, Building2, Users, Lock } from "lucide-react";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { user } = session;

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Settings</h1>
        <p className="text-navy-500 mt-1">
          Manage your profile, organization, and team settings.
        </p>
      </div>

      {/* Profile Section */}
      <section className="bg-white border border-navy-200 rounded-xl overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 bg-navy-50 border-b border-navy-200">
          <User className="w-5 h-5 text-navy-600" />
          <h2 className="font-semibold text-navy-900">Profile</h2>
        </div>
        <div className="p-6 space-y-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-ocean-500 to-ocean-700 flex items-center justify-center">
              <span className="text-xl font-semibold text-white">
                {user.name
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2) ?? "U"}
              </span>
            </div>
            <div>
              <p className="font-medium text-navy-900">{user.name}</p>
              <p className="text-sm text-navy-500">{user.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={user.name ?? ""}
                readOnly
                className="w-full px-3 py-2 border border-navy-200 rounded-lg text-sm bg-navy-50 text-navy-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={user.email ?? ""}
                readOnly
                className="w-full px-3 py-2 border border-navy-200 rounded-lg text-sm bg-navy-50 text-navy-600"
              />
            </div>
          </div>

          <button
            disabled
            className="px-4 py-2 text-sm font-medium text-navy-400 bg-navy-100 rounded-lg cursor-not-allowed"
            title="Coming soon"
          >
            Edit Profile
          </button>
        </div>
      </section>

      {/* Organization Section */}
      <section className="bg-white border border-navy-200 rounded-xl overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 bg-navy-50 border-b border-navy-200">
          <Building2 className="w-5 h-5 text-navy-600" />
          <h2 className="font-semibold text-navy-900">Organization</h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1">
                Organization Name
              </label>
              <input
                type="text"
                value="My Organization"
                readOnly
                className="w-full px-3 py-2 border border-navy-200 rounded-lg text-sm bg-navy-50 text-navy-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1">
                Slug
              </label>
              <input
                type="text"
                value={user.orgId ?? "stub-org"}
                readOnly
                className="w-full px-3 py-2 border border-navy-200 rounded-lg text-sm bg-navy-50 text-navy-600"
              />
            </div>
          </div>

          <button
            disabled
            className="px-4 py-2 text-sm font-medium text-navy-400 bg-navy-100 rounded-lg cursor-not-allowed"
            title="Coming soon"
          >
            Edit Organization
          </button>
        </div>
      </section>

      {/* Team Section */}
      <section className="bg-white border border-navy-200 rounded-xl overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 bg-navy-50 border-b border-navy-200">
          <Users className="w-5 h-5 text-navy-600" />
          <h2 className="font-semibold text-navy-900">Team Members</h2>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between p-4 bg-navy-50 rounded-lg border border-navy-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-ocean-500 to-ocean-700 flex items-center justify-center">
                <span className="text-sm font-semibold text-white">
                  {user.name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2) ?? "U"}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-navy-900">
                  {user.name}
                </p>
                <p className="text-xs text-navy-500">{user.email}</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-ocean-50 text-ocean-700 rounded-full">
              <Lock className="w-3 h-3" />
              Owner
            </span>
          </div>

          <button
            disabled
            className="mt-4 px-4 py-2 text-sm font-medium text-navy-400 bg-navy-100 rounded-lg cursor-not-allowed"
            title="Coming soon"
          >
            Invite Team Member
          </button>
        </div>
      </section>
    </div>
  );
}

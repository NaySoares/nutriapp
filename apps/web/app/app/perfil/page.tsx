import { ProfileForm } from "../../../components/profile-form";
import { SideBar } from "../../../components/sidebar";
export default function ProfilePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="flex items-start w-full min-w-full justify-start mx-auto max-w-3xl">
        <SideBar />
        <div className="flex flex-col gap-4 ml-8 w-full bg-red-400 p-8">
          <p className="text-emerald-700 text-bold">Perfil</p>
        </div>
      </div>
    </main>
  );
}

import { useEffect, useState } from "react";
import { ChefHat, Plus, Trash2, Eye, EyeOff, KeyRound } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Chef = { id: number; name: string; login: string; password: string; createdAt?: string };

export default function AdminChefs() {
  const [chefs, setChefs] = useState<Chef[]>([]);
  const [name, setName] = useState("");
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [shown, setShown] = useState<Record<number, boolean>>({});

  const load = async () => {
    const r = await fetch("/api/admin/chefs");
    if (r.ok) setChefs(await r.json());
  };
  useEffect(() => { load(); }, []);

  const create = async () => {
    setError("");
    setSaving(true);
    const r = await fetch("/api/admin/chefs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, login, password }),
    });
    setSaving(false);
    if (!r.ok) { setError((await r.json()).error || "Xatolik"); return; }
    setName(""); setLogin(""); setPassword("");
    load();
  };

  const remove = async (id: number) => {
    if (!confirm("Oshpazni o'chirasizmi?")) return;
    await fetch(`/api/admin/chefs/${id}`, { method: "DELETE" });
    load();
  };

  const changePassword = async (id: number) => {
    const pw = prompt("Yangi parol (kamida 4 belgi):");
    if (!pw || pw.length < 4) return;
    await fetch(`/api/admin/chefs/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: pw }),
    });
    load();
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><ChefHat className="w-6 h-6" /> Oshpazlar</h1>
        <p className="text-sm text-muted-foreground">Oshpaz paneliga (/chef) kirish uchun login va parollar</p>
      </div>

      <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
        <h2 className="font-semibold">Yangi oshpaz</h2>
        <div className="grid sm:grid-cols-3 gap-2">
          <Input placeholder="Ism" value={name} onChange={(e) => setName(e.target.value)} />
          <Input placeholder="Login" value={login} onChange={(e) => setLogin(e.target.value)} />
          <Input placeholder="Parol" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button onClick={create} disabled={saving}><Plus className="w-4 h-4 mr-1" /> Qo'shish</Button>
      </div>

      <div className="space-y-2">
        {chefs.length === 0 && (
          <p className="text-sm text-muted-foreground">Hali oshpaz yo'q. Hozircha Sozlamalardagi umumiy parol ishlaydi.</p>
        )}
        {chefs.map((c) => (
          <div key={c.id} className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="font-semibold">{c.name}</p>
              <p className="text-sm text-muted-foreground">
                Login: <b>{c.login}</b> · Parol: <b>{shown[c.id] ? c.password : "••••••"}</b>
              </p>
            </div>
            <div className="flex gap-1">
              <Button size="icon" variant="ghost" onClick={() => setShown({ ...shown, [c.id]: !shown[c.id] })}>
                {shown[c.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
              <Button size="icon" variant="ghost" onClick={() => changePassword(c.id)}><KeyRound className="w-4 h-4" /></Button>
              <Button size="icon" variant="ghost" onClick={() => remove(c.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import { FormularioLogin } from "./formulario";

export default function Login() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-6">
      <h1 className="font-serif text-4xl text-verde-700">Rosedal</h1>
      <p className="mt-2 text-tinta-suave">Tu estudio editorial.</p>
      <FormularioLogin />
    </main>
  );
}

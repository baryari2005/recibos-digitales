"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "../schemas";
import { useAuth } from "@/stores/auth";
import { messages } from "@/utils/messages";
import { readDraft, writeDraft, clearDraft, readTopError, writeTopError, clearTopError } from "./storage";

export type Values = z.infer<typeof loginSchema>;

export function useLogin() {
  const { login, triedMe, token, user, fetchMe } = useAuth();

  const [mounted, setMounted] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const netSubmittingRef = useRef(false);
  const fetchedMeOnceRef = useRef(false);

  const form = useForm<Values>({
    resolver: zodResolver(loginSchema),
    defaultValues: { userId: "", password: "" },
    mode: "onSubmit",
  });

  // hidratar desde storage al montar
  useEffect(() => {
    setMounted(true);
    const draft = readDraft<Partial<Values>>({});
    form.reset({ userId: draft.userId ?? "", password: draft.password ?? "" });
    const err = readTopError();
    if (err) setAuthError(err);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // persistir mientras se escribe
  useEffect(() => {
    if (!mounted) return;
    const sub = form.watch((vals) => writeDraft(vals as Values));
    return () => sub.unsubscribe();
  }, [form, mounted]);

  // fetchMe una sola vez (mitiga StrictMode)
  useEffect(() => {
    if (!fetchedMeOnceRef.current) {
      fetchedMeOnceRef.current = true;
      if (!triedMe) fetchMe();
    }
  }, [triedMe, fetchMe]);

  const topError = useMemo(() => {
    if (!mounted) return null;
    if (authError) return authError;
    if (!form.formState.isSubmitted) return null;
    const { errors } = form.formState;
    if (errors.userId?.message && errors.password?.message) return messages.errors.loginError;
    return errors.userId?.message || errors.password?.message || null;
  }, [mounted, authError, form.formState]);

  const onSubmit = async (values: Values) => {
    if (netSubmittingRef.current) return;
    netSubmittingRef.current = true;
    setAuthError(null);
    try {
      const ok = await login({ userId: values.userId, password: values.password });
      if (!ok) {
        const msg = messages.errors.loginError;
        setAuthError(msg);
        writeTopError(msg);
        return;
      }
      clearDraft();
      clearTopError();
    } finally {
      netSubmittingRef.current = false;
    }
  };

  return { form, onSubmit, topError, clearTopError, netSubmittingRef, triedMe, token, user };
}

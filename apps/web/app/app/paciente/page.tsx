"use client";

import { useEffect, useState } from "react";
import { PatientForm } from "../../../components/patient-form";

export default function PatientPage() {
  const [patientId, setPatientId] = useState<string>();

  useEffect(() => {
    setPatientId(new URLSearchParams(window.location.search).get("id") ?? undefined);
  }, []);

  return <PatientForm patientId={patientId} />;
}

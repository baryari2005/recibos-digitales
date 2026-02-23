import axios from "axios";

export async function cancelLeave(id: string) {
  const token = localStorage.getItem("token");

  await axios.post(
    `/api/leaves/${id}/cancel`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
}

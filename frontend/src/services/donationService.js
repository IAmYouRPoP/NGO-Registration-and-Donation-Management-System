const BASE_URL = "http://localhost:5000/api/donations";

export const getMyDonations = async () => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${BASE_URL}/my`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.json();
};

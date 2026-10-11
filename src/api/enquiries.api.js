import api from "./axios";

export async function submitProductEnquiry(data) {
  const response = await api.post("/enquiries", data);
  return response.data;
}

export async function getProductEnquiries() {
  const response = await api.get("/enquiries");
  return response.data;
}

export async function updateProductEnquiryStatus(id, contacted) {
  const response = await api.patch(`/enquiries/${id}/contacted`, { contacted });
  return response.data;
}

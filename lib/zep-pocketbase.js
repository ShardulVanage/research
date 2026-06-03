import PocketBase from "pocketbase"

const zpb = new PocketBase(process.env.NEXT_PUBLIC_ZEP_POCKETBASE_URL).autoCancellation(false)

export default zpb

export const getImageUrl = (record, filename) => {
  return zpb.files.getUrl(record, filename)
}

export const getConferences = async () => {
  try {
    const records = await zpb.collection("Conference").getFullList({
      sort: "order",
    })
    return { success: true, data: records }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export const getConferenceById = async (id) => {
  try {
    const record = await zpb.collection("Conference").getOne(id)
    return { success: true, data: record }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

import PocketBase from "pocketbase"

const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL).autoCancellation(false)

export default pb

export const getImageUrl = (record, filename) => {
  return pb.files.getUrl(record, filename)
}

export const authWithGoogle = async () => {
  try {
    const authData = await pb.collection("users").authWithOAuth2({ provider: "google" })
    return { success: true, data: authData }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export const loginWithEmail = async (email, password) => {
  try {
    const authData = await pb.collection("users").authWithPassword(email, password)
    return { success: true, data: authData }
  } catch (error) {
    return { success: false, error: error.message, details: error.data }
  }
}

export const signupWithEmail = async (userData) => {
  try {
    const record = await pb.collection("users").create(userData)
    await pb.collection("users").authWithPassword(userData.email, userData.password)
    return { success: true, data: record }
  } catch (error) {
    return { success: false, error: error.message, details: error.data }
  }
}

export const logout = () => {
  pb.authStore.clear()
}

export const getCurrentUser = () => {
  return pb.authStore.model
}

export const isAuthenticated = () => {
  return pb.authStore.isValid
}

// Publications
export const getPublications = async (page = 1, perPage = 20) => {
  try {
    const records = await pb.collection("publications").getList(page, perPage, {
      expand: "user,co_authors_list,co_authors_list.user",
      sort: "-created",
      filter: "public = true",
    })
    return { success: true, data: records }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export const searchPublications = async (query, page = 1, perPage = 20) => {
  try {
    const filter = `(title ~ "${query}" || abstract ~ "${query}" || keywords ~ "${query}") && public = true`
    const records = await pb.collection("publications").getList(page, perPage, {
      expand: "user,co_authors_list,co_authors_list.user",
      sort: "-created",
      filter: filter,
    })
    return { success: true, data: records }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export const getPublicationById = async (id) => {
  try {
    const record = await pb.collection("publications").getOne(id, {
      expand: "user,co_authors_list,co_authors_list.user",
    })
    return { success: true, data: record }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export const createPublication = async (publicationData) => {
  try {
    const record = await pb.collection("publications").create(publicationData)
    return { success: true, data: record }
  } catch (error) {
    return { success: false, error: error.message, details: error.data }
  }
}

export const updatePublication = async (id, publicationData) => {
  try {
    const record = await pb.collection("publications").update(id, publicationData)
    return { success: true, data: record }
  } catch (error) {
    return { success: false, error: error.message, details: error.data }
  }
}

export const deletePublication = async (id) => {
  try {
    await pb.collection("publications").delete(id)
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export const getUserPublications = async (userId, page = 1, perPage = 20) => {
  try {
    const records = await pb.collection("publications").getList(page, perPage, {
      expand: "user,co_authors_list,co_authors_list.user",
      sort: "-created",
      filter: `user = "${userId}"`,
    })
    return { success: true, data: records }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Co-authors
export const createCoAuthor = async (coAuthorData) => {
  try {
    const record = await pb.collection("co_authors").create(coAuthorData)
    return { success: true, data: record }
  } catch (error) {
    return { success: false, error: error.message, details: error.data }
  }
}

export const getCoAuthors = async (publicationId) => {
  try {
    const records = await pb.collection("co_authors").getList(1, 50, {
      expand: "user",
      sort: "order",
      filter: `publication = "${publicationId}"`,
    })
    return { success: true, data: records }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export const deleteCoAuthor = async (id) => {
  try {
    await pb.collection("co_authors").delete(id)
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Publication Files
export const createPublicationFile = async (fileData) => {
  try {
    const record = await pb.collection("publication_files").create(fileData)
    return { success: true, data: record }
  } catch (error) {
    return { success: false, error: error.message, details: error.data }
  }
}

export const getPublicationFiles = async (publicationId) => {
  try {
    const records = await pb.collection("publication_files").getList(1, 50, {
      sort: "created",
      filter: `publication = "${publicationId}"`,
    })
    return { success: true, data: records }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export const deletePublicationFile = async (id) => {
  try {
    await pb.collection("publication_files").delete(id)
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Comments
export const getComments = async (publicationId) => {
  try {
    const records = await pb.collection("comments").getList(1, 50, {
      expand: "user",
      sort: "created",
      filter: `publication = "${publicationId}"`,
    })
    return { success: true, data: records }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export const createComment = async (commentData) => {
  try {
    const record = await pb.collection("comments").create(commentData)
    return { success: true, data: record }
  } catch (error) {
    return { success: false, error: error.message, details: error.data }
  }
}

// User Profile
export const getUserById = async (id) => {
  try {
    const record = await pb.collection("users").getOne(id)
    return { success: true, data: record }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export const updateUserProfile = async (id, userData) => {
  try {
    const record = await pb.collection("users").update(id, userData)
    return { success: true, data: record }
  } catch (error) {
    return { success: false, error: error.message, details: error.data }
  }
}

// Increment view count
export const incrementViewCount = async (publicationId) => {
  try {
    const publication = await pb.collection("publications").getOne(publicationId)
    const newCount = (publication.views_count || 0) + 1
    await pb.collection("publications").update(publicationId, { views_count: newCount })
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Increment download count
export const incrementDownloadCount = async (publicationId) => {
  try {
    const publication = await pb.collection("publications").getOne(publicationId)
    const newCount = (publication.downloads_count || 0) + 1
    await pb.collection("publications").update(publicationId, { downloads_count: newCount })
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Education
export const getEducation = async (userId) => {
  try {
    const records = await pb.collection("education").getList(1, 50, {
      sort: "-start_year",
      filter: `user = "${userId}"`,
    })
    return { success: true, data: records }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export const createEducation = async (educationData) => {
  try {
    const record = await pb.collection("education").create(educationData)
    return { success: true, data: record }
  } catch (error) {
    return { success: false, error: error.message, details: error.data }
  }
}

export const updateEducation = async (id, educationData) => {
  try {
    const record = await pb.collection("education").update(id, educationData)
    return { success: true, data: record }
  } catch (error) {
    return { success: false, error: error.message, details: error.data }
  }
}

export const deleteEducation = async (id) => {
  try {
    await pb.collection("education").delete(id)
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Experience
export const getExperiences = async (userId) => {
  try {
    const records = await pb.collection("experiences").getList(1, 50, {
      sort: "-start_date",
      filter: `user = "${userId}"`,
    })
    return { success: true, data: records }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export const createExperience = async (experienceData) => {
  try {
    const record = await pb.collection("experiences").create(experienceData)
    return { success: true, data: record }
  } catch (error) {
    return { success: false, error: error.message, details: error.data }
  }
}

export const updateExperience = async (id, experienceData) => {
  try {
    const record = await pb.collection("experiences").update(id, experienceData)
    return { success: true, data: record }
  } catch (error) {
    return { success: false, error: error.message, details: error.data }
  }
}

export const deleteExperience = async (id) => {
  try {
    await pb.collection("experiences").delete(id)
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Certifications
export const getCertifications = async (userId) => {
  try {
    const records = await pb.collection("certifications").getList(1, 50, {
      sort: "-issue_date",
      filter: `user = "${userId}"`,
    })
    return { success: true, data: records }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export const createCertification = async (certificationData) => {
  try {
    const record = await pb.collection("certifications").create(certificationData)
    return { success: true, data: record }
  } catch (error) {
    return { success: false, error: error.message, details: error.data }
  }
}

export const updateCertification = async (id, certificationData) => {
  try {
    const record = await pb.collection("certifications").update(id, certificationData)
    return { success: true, data: record }
  } catch (error) {
    return { success: false, error: error.message, details: error.data }
  }
}

export const deleteCertification = async (id) => {
  try {
    await pb.collection("certifications").delete(id)
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Projects
export const getProjects = async (userId) => {
  try {
    const records = await pb.collection("projects").getList(1, 50, {
      sort: "-start_date",
      filter: `user = "${userId}"`,
    })
    return { success: true, data: records }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export const createProject = async (projectData) => {
  try {
    const record = await pb.collection("projects").create(projectData)
    return { success: true, data: record }
  } catch (error) {
    return { success: false, error: error.message, details: error.data }
  }
}

export const updateProject = async (id, projectData) => {
  try {
    const record = await pb.collection("projects").update(id, projectData)
    return { success: true, data: record }
  } catch (error) {
    return { success: false, error: error.message, details: error.data }
  }
}

export const deleteProject = async (id) => {
  try {
    await pb.collection("projects").delete(id)
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Skills
export const getSkills = async (userId) => {
  try {
    const records = await pb.collection("skills").getList(1, 50, {
      sort: "-endorsement_count",
      filter: `user = "${userId}"`,
    })
    return { success: true, data: records }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export const createSkill = async (skillData) => {
  try {
    const record = await pb.collection("skills").create(skillData)
    return { success: true, data: record }
  } catch (error) {
    return { success: false, error: error.message, details: error.data }
  }
}

export const updateSkill = async (id, skillData) => {
  try {
    const record = await pb.collection("skills").update(id, skillData)
    return { success: true, data: record }
  } catch (error) {
    return { success: false, error: error.message, details: error.data }
  }
}

export const deleteSkill = async (id) => {
  try {
    await pb.collection("skills").delete(id)
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Journals
export const getJournals = async (page = 1, perPage = 20) => {
  try {
    const records = await pb.collection("Journals").getList(page, perPage, {
      sort: "-created",
      filter: "not_visible = false || not_visible = null",
    })
    return { success: true, data: records }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export const getJournalById = async (id) => {
  try {
    const record = await pb.collection("Journals").getOne(id)
    return { success: true, data: record }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export const searchJournals = async (query, page = 1, perPage = 20) => {
  try {
    const filter = `(title ~ "${query}" || issncode ~ "${query}") && (not_visible = false || not_visible = null)`
    const records = await pb.collection("Journals").getList(page, perPage, {
      sort: "-created",
      filter: filter,
    })
    return { success: true, data: records }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Paper Form Submissions
export const submitPaperForm = async (submissionData) => {
  try {
    const record = await pb.collection("paper_form_submission").create(submissionData)
    return { success: true, data: record }
  } catch (error) {
    return { success: false, error: error.message, details: error.data }
  }
}

export const getUserSubmissions = async (userId, page = 1, perPage = 20) => {
  try {
    const records = await pb.collection("paper_form_submission").getList(page, perPage, {
      sort: "-created",
      filter: `user = "${userId}"`,
    })
    return { success: true, data: records }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export const getSubmissionById = async (id) => {
  try {
    const record = await pb.collection("paper_form_submission").getOne(id)
    return { success: true, data: record }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export const updateSubmission = async (id, submissionData) => {
  try {
    const record = await pb.collection("paper_form_submission").update(id, submissionData)
    return { success: true, data: record }
  } catch (error) {
    return { success: false, error: error.message, details: error.data }
  }
}

export const deleteSubmission = async (id) => {
  try {
    await pb.collection("paper_form_submission").delete(id)
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// OTP Authentication
export const requestOTP = async (email) => {
  try {
    const result = await pb.collection("users").requestOTP(email)
    return { success: true, data: result }
  } catch (error) {
    // Even if user doesn't exist, show generic message to prevent email enumeration
    if (error.status === 404 || error.message.includes("not found")) {
      return { success: false, error: "If this email is registered, you will receive an OTP.", userNotFound: true }
    }
    return { success: false, error: error.message }
  }
}

export const confirmOTP = async (otpId, otp) => {
  try {
    const authData = await pb.collection("users").authWithOTP(otpId, otp)
    return { success: true, data: authData }
  } catch (error) {
    return { success: false, error: error.message, details: error.data }
  }
}

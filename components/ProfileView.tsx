const handleUpdateProfile = async () => {
  setIsUploadingImages(true);
  try {
    let finalAvatarUrl = profileData.avatarUrl;
    let finalCoverImageUrl = profileData.coverImageUrl || DEFAULT_PROFILE_COVER;

    // 1. Upload Avatar
    if (avatarFile) {
      finalAvatarUrl = await uploadImageToStorage(
        avatarFile,
        `users/\( {profileData.id}/avatar_ \){Date.now()}.jpg`
      );
    } else if (editAvatarUrl && editAvatarUrl.startsWith('data:')) {
      finalAvatarUrl = await uploadImageToStorage(
        editAvatarUrl,
        `users/\( {profileData.id}/avatar_ \){Date.now()}.jpg`
      );
    } else if (editAvatarUrl) {
      finalAvatarUrl = editAvatarUrl;
    }

    // 2. Upload Cover Image
    if (coverFile) {
      finalCoverImageUrl = await uploadImageToStorage(
        coverFile,
        `users/\( {profileData.id}/cover_ \){Date.now()}.jpg`
      );
    } else if (editCoverImageUrl && editCoverImageUrl.startsWith('data:')) {
      finalCoverImageUrl = await uploadImageToStorage(
        editCoverImageUrl,
        `users/\( {profileData.id}/cover_ \){Date.now()}.jpg`
      );
    } else if (editCoverImageUrl) {
      finalCoverImageUrl = editCoverImageUrl;
    }

    // Safety check – never save data URLs
    if (
      (finalAvatarUrl && finalAvatarUrl.startsWith('data:')) ||
      (finalCoverImageUrl && finalCoverImageUrl.startsWith('data:'))
    ) {
      throw new Error('Image upload did not complete. Please try again with a smaller photo.');
    }

    const updatedProfile: ServiceProvider = {
      ...profileData,
      name: editName,
      service: editService,
      avatarUrl: finalAvatarUrl,
      coverImageUrl: finalCoverImageUrl,
      about: editAbout.slice(0, 280),
      selectedProfileButtons: editButtons
    };

    // Save to Firestore
    await saveUserProfileToFirestore(profileData.id, updatedProfile);

    // Update app state
    onUpdate(updatedProfile);
    setIsEditing(false);
    setAvatarFile(null);
    setCoverFile(null);
  } catch (err: any) {
    console.error('Error updating profile images or saving:', err);
    alert(err?.message || 'An error occurred while saving profile changes. Please try again.');
  } finally {
    setIsUploadingImages(false);
  }
};
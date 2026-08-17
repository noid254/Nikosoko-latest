const handleUpdateProfile = async () => {
  setIsUploadingImages(true);
  try {
    let finalAvatarUrl = profileData.avatarUrl;
    let finalCoverImageUrl = profileData.coverImageUrl || DEFAULT_PROFILE_COVER;

    console.log('Starting profile update...');

    if (avatarFile || (editAvatarUrl && editAvatarUrl.startsWith('data:'))) {
      alert('Uploading avatar...');
      finalAvatarUrl = await uploadImageToStorage(
        avatarFile || editAvatarUrl,
        `users/\( {profileData.id}/avatar_ \){Date.now()}.jpg`
      );
      console.log('Avatar uploaded:', finalAvatarUrl);
      alert('Avatar uploaded successfully!\n' + finalAvatarUrl.substring(0, 80) + '...');
    }

    if (coverFile || (editCoverImageUrl && editCoverImageUrl.startsWith('data:'))) {
      alert('Uploading cover...');
      finalCoverImageUrl = await uploadImageToStorage(
        coverFile || editCoverImageUrl,
        `users/\( {profileData.id}/cover_ \){Date.now()}.jpg`
      );
      console.log('Cover uploaded:', finalCoverImageUrl);
    }

    if (finalAvatarUrl.startsWith('data:') || finalCoverImageUrl.startsWith('data:')) {
      throw new Error('Upload failed – still got a data URL');
    }

    const updatedProfile = {
      ...profileData,
      name: editName,
      service: editService,
      avatarUrl: finalAvatarUrl,
      coverImageUrl: finalCoverImageUrl,
      about: editAbout.slice(0, 280),
      selectedProfileButtons: editButtons
    };

    await saveUserProfileToFirestore(profileData.id, updatedProfile);
    onUpdate(updatedProfile);

    alert('Profile saved successfully!\nAvatar: ' + finalAvatarUrl.substring(0, 60) + '...');
    setIsEditing(false);
    setAvatarFile(null);
    setCoverFile(null);
  } catch (err: any) {
    console.error(err);
    alert('ERROR: ' + (err?.message || 'Unknown error'));
  } finally {
    setIsUploadingImages(false);
  }
};
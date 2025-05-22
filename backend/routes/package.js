router.get('/:id', async (req, res) => {
  const packageId = req.params.id;
  try {
    const tourPackage = await Package.findById(packageId); // or your model
    if (!tourPackage) {
      return res.status(404).json({ message: 'Package not found' });
    }
    res.json(tourPackage);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

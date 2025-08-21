module.exports = {
  fileTypeFromBuffer: jest.fn().mockResolvedValue({
    ext: 'pdf',
    mime: 'application/pdf',
  }),
};

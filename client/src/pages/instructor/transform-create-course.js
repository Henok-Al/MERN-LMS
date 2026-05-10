const fs = require('fs');
const path = 'create-course.jsx';
let content = fs.readFileSync(path, 'utf8');

// Add new state variables after newLesson state
content = content.replace(
  `const [newLesson, setNewLesson] = useState({
    chapterId: "",
    title: "",
    description: "",
    duration: 0,
    videoUrl: "",
  });`,
  `const [newLesson, setNewLesson] = useState({
    chapterId: "",
    title: "",
    description: "",
    duration: 0,
    videoUrl: "",
  });
  const [activeTab, setActiveTab] = useState("basic");
  const [courseCreated, setCourseCreated] = useState(false);
  const [createdCourseId, setCreatedCourseId] = useState("");`
);

// Replace create mode section with tabbed interface
const createModePattern = `) : (
              /* Create mode - no tabs, just basic info */
              <section className="space-y-8">
                <h2 className="text-xl font-bold">Basic Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium leading-none mb-2 block">
                      Course Title *
                    </label>
                    <input
                      {...register("title")}
                      placeholder="e.g., Complete React Course"
                      className={inputClass}
                    />
                    {errors.title && (
                      <p className={errorClass}>{errors.title.message}</p>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium leading-none mb-2 block">
                      Subtitle
                    </label>
                    <input
                      {...register("subtitle")}
                      placeholder="Short tagline for your course"
                      className={inputClass}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium leading-none mb-2 block">
                      Short Description
                    </label>
                    <textarea
                      {...register("smallDescription")}
                      placeholder="Brief description (max 300 characters)"
                      className={textareaClass}
                      rows={2}
                    />
                    {errors.smallDescription && (
                      <p className={errorClass}>{errors.smallDescription.message}</p>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium leading-none mb-2 block">
                      Full Description
                    </label>
                    <RichTextEditor
                      value={watch("description")}
                      onChange={(html) => setValue("description", html)}
                      placeholder="Detailed description of your course..."
                      minHeight="250px"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium leading-none mb-2 block">
                      Category
                    </label>
                    <select {...register("category")} className={inputClass}>
                      <option value="General">General</option>
                      <option value="Web Development">Web Development</option>
                      <option value="Mobile Development">Mobile Development</option>
                      <option value="Data Science">Data Science</option>
                      <option value="Design">Design</option>
                      <option value="Business">Business</option>
                      <option value="Marketing">Marketing</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium leading-none mb-2 block">
                      Level
                    </label>
                    <select {...register("level")} className={inputClass}>
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium leading-none mb-2 block">
                      Language
                    </label>
                    <input {...register("primaryLanguage")} className={inputClass} />
                  </div>
                  <div>
                    <label className="text-sm font-medium leading-none mb-2 block">
                      Duration (hours)
                    </label>
                    <input
                      {...register("duration")}
                      type="number"
                      className={inputClass}
                    />
                    {errors.duration && (
                      <p className={errorClass}>{errors.duration.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium leading-none mb-2 block">
                      Price ($)
                    </label>
                    <input
                      {...register("pricing")}
                      type="number"
                      className={inputClass}
                    />
                    {errors.pricing && (
                      <p className={errorClass}>{errors.pricing.message}</p>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium leading-none mb-2 block">
                      Thumbnail Image
                    </label>
                    <FileUploader
                      value={watch("image")}
                      onChange={(url) => setValue("image", url)}
                      endpoint="/media/upload"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium leading-none mb-2 block">
                      What You'll Learn (one per line)
                    </label>
                    <textarea
                      {...register("objectives")}
                      placeholder="Build full-stack applications..."
                      className={textareaClass}
                      rows={4}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium leading-none mb-2 block">
                      Welcome Message
                    </label>
                    <textarea
                      {...register("welcomeMessage")}
                      placeholder="Welcome to the course!"
                      className={textareaClass}
                      rows={3}
                    />
                  </div>
                </div>
              </section>`;

const newCreateMode = `) : (
              /* Create mode - using tabs */
              <Tabs defaultValue="basic" value={activeTab} onValueChange={handleTabChange} className="space-y-6">
                <TabsList className="w-full justify-start border-b rounded-none bg-transparent p-0 h-auto gap-0">
                  <TabsTrigger
                    value="basic"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 py-3 text-sm font-semibold transition-colors"
                  >
                    Basic Information
                  </TabsTrigger>
                  <TabsTrigger
                    value="curriculum"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 py-3 text-sm font-semibold transition-colors"
                    disabled={!courseCreated}
                  >
                    Course Curriculum
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-0 pt-2">
                  <section className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium leading-none mb-2 block">
                          Course Title *
                        </label>
                        <input
                          {...register("title")}
                          placeholder="e.g., Complete React Course"
                          className={inputClass}
                        />
                        {errors.title && (
                          <p className={errorClass}>{errors.title.message}</p>
                        )}
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium leading-none mb-2 block">
                          Subtitle
                        </label>
                        <input
                          {...register("subtitle")}
                          placeholder="Short tagline for your course"
                          className={inputClass}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium leading-none mb-2 block">
                          Short Description
                        </label>
                        <textarea
                          {...register("smallDescription")}
                          placeholder="Brief description (max 300 characters)"
                          className={textareaClass}
                          rows={2}
                        />
                        {errors.smallDescription && (
                          <p className={errorClass}>{errors.smallDescription.message}</p>
                        )}
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium leading-none mb-2 block">
                          Full Description
                        </label>
                        <RichTextEditor
                          value={watch("description")}
                          onChange={(html) => setValue("description", html)}
                          placeholder="Detailed description of your course..."
                          minHeight="250px"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium leading-none mb-2 block">
                          Category
                        </label>
                        <select {...register("category")} className={inputClass}>
                          <option value="General">General</option>
                          <option value="Web Development">Web Development</option>
                          <option value="Mobile Development">Mobile Development</option>
                          <option value="Data Science">Data Science</option>
                          <option value="Design">Design</option>
                          <option value="Business">Business</option>
                          <option value="Marketing">Marketing</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium leading-none mb-2 block">
                          Level
                        </label>
                        <select {...register("level")} className={inputClass}>
                          <option value="Beginner">Beginner</option>
                          <option value="Intermediate">Intermediate</option>
                          <option value="Advanced">Advanced</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium leading-none mb-2 block">
                          Language
                        </label>
                        <input {...register("primaryLanguage")} className={inputClass} />
                      </div>
                      <div>
                        <label className="text-sm font-medium leading-none mb-2 block">
                          Duration (hours)
                        </label>
                        <input
                          {...register("duration")}
                          type="number"
                          className={inputClass}
                        />
                        {errors.duration && (
                          <p className={errorClass}>{errors.duration.message}</p>
                        )}
                      </div>
                      <div>
                        <label className="text-sm font-medium leading-none mb-2 block">
                          Price ($)
                        </label>
                        <input
                          {...register("pricing")}
                          type="number"
                          className={inputClass}
                        />
                        {errors.pricing && (
                          <p className={errorClass}>{errors.pricing.message}</p>
                        )}
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium leading-none mb-2 block">
                          Thumbnail Image
                        </label>
                        <FileUploader
                          value={watch("image")}
                          onChange={(url) => setValue("image", url)}
                          endpoint="/media/upload"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium leading-none mb-2 block">
                          What You'll Learn (one per line)
                        </label>
                        <textarea
                          {...register("objectives")}
                          placeholder="Build full-stack applications..."
                          className={textareaClass}
                          rows={4}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium leading-none mb-2 block">
                          Welcome Message
                        </label>
                        <textarea
                          {...register("welcomeMessage")}
                          placeholder="Welcome to the course!"
                          className={textareaClass}
                          rows={3}
                        />
                      </div>
                    </div>
                  </section>
                </TabsContent>

                <TabsContent value="curriculum" className="space-y-0 pt-2">
                  {!courseCreated ? (
                    <div className="text-center py-12 border-2 border-dashed rounded-lg">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground mb-4" />
                      <p className="text-sm text-muted-foreground">Creating course...</p>
                    </div>
                  ) : (
                    <section className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-lg font-semibold">Course Curriculum</h2>
                          <p className="text-xs text-muted-foreground mt-1">
                            Drag and drop chapters and lessons to reorder. Add lessons inside each chapter.
                          </p>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {chapters.length} chapter{chapters.length !== 1 ? "s" : ""}
                        </span>
                      </div>

                      {/* Add Chapter */}
                      <div className="flex gap-2">
                        <input
                          value={newChapterTitle}
                          onChange={(e) => setNewChapterTitle(e.target.value)}
                          placeholder="New chapter title..."
                          className={inputClass + " flex-1"}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addChapter();
                            }
                          }}
                        />
                        <Button onClick={addChapter} size="sm" type="button">
                          <Plus className="h-4 w-4 mr-1" />
                          Add Chapter
                        </Button>
                      </div>

                      {/* Chapters with Drag and Drop */}
                      {chapters.length === 0 ? (
                        <div className="border-2 border-dashed rounded-xl p-8 text-center">
                          <BookOpen className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
                          <h3 className="font-semibold mb-1">No chapters yet</h3>
                          <p className="text-sm text-muted-foreground">
                            Add your first chapter to start building your course structure.
                          </p>
                        </div>
                      ) : (
                        <DndContext
                          sensors={sensors}
                          collisionDetection={closestCenter}
                          onDragEnd={handleChapterDragEnd}
                        >
                          <SortableContext
                            items={chapters.map((ch) => ch._id)}
                            strategy={verticalListSortingStrategy}
                          >
                            <div className="space-y-3">
                              {chapters.map((chapter, chIdx) => (
                                <SortableChapter
                                  key={chapter._id}
                                  chapter={chapter}
                                  chIdx={chIdx}
                                  onDelete={deleteChapter}
                                  onAddLesson={addLesson}
                                  onDeleteLesson={deleteLesson}
                                  handleLessonDragEnd={handleLessonDragEnd(chapter._id)}
                                  newLesson={newLesson}
                                  setNewLesson={setNewLesson}
                                  inputClass={inputClass}
                                  lessons={chapter.lessons}
                                  sensors={sensors}
                                />
                              ))}
                            </div>
                          </SortableContext>
                        </DndContext>
                      )}
                    </section>
                  )}
                </TabsContent>
              </Tabs>`;

content = content.replace(createModePattern, newCreateMode);

// Add handleTabChange function before handleChapterCreated
const tabHandler = `  // Handle tab change in create mode - auto-create course when switching to curriculum
  const handleTabChange = async (tab) => {
    if (isEditing) {
      setActiveTab(tab);
      return;
    }
    
    if (tab === "curriculum" && !courseCreated) {
      // Create the course first with basic info
      try {
        const formData = getValues();
        const res = await api.post("/courses", formData);
        const newCourse = res.data.data;
        setCreatedCourseId(newCourse._id);
        setCourseCreated(true);
        setActiveTab("curriculum");
        toast.success("Course created! Now add your curriculum.");
        // Update the URL to edit mode without reload
        navigate(`/instructor/edit/${newCourse._id}`, { replace: true });
      } catch (err) {
        toast.error(err?.response?.data?.message || "Failed to create course");
      }
    } else {
      setActiveTab(tab);
    }
  };

  `;

content = content.replace(
  `const handleChapterCreated = (chapter) => {`,
  tabHandler + `const handleChapterCreated = (chapter) => {`
);

// Update addChapter to use createdCourseId
content = content.replace(
  `const addChapter = async () => {
    if (!newChapterTitle.trim()) return;
    try {
      const res = await api.post("/courses/chapters", {
        courseId: id,
        title: newChapterTitle,
      });`,
  `const addChapter = async () => {
    if (!newChapterTitle.trim()) return;
    try {
      const courseIdToUse = isEditing ? id : createdCourseId;
      const res = await api.post("/courses/chapters", {
        courseId: courseIdToUse,
        title: newChapterTitle,
      });`
);

// Update deleteChapter
content = content.replace(
  `const deleteChapter = async (chapterId) => {
    try {
      await api.delete(\`/courses/chapters/\${chapterId}\`);`,
  `const deleteChapter = async (chapterId) => {
    try {
      const courseIdToUse = isEditing ? id : createdCourseId;
      await api.delete(\`/courses/chapters/\${chapterId}\`);`
);

// Update addLesson
content = content.replace(
  `const addLesson = async (chapterId) => {
    if (!newLesson.title.trim()) return;
    try {
      const res = await api.post(\`/courses/chapters/\${chapterId}/lessons\`, {`,
  `const addLesson = async (chapterId) => {
    if (!newLesson.title.trim()) return;
    try {
      const courseIdToUse = isEditing ? id : createdCourseId;
      const res = await api.post(\`/courses/chapters/\${chapterId}/lessons\`, {`
);

// Update deleteLesson
content = content.replace(
  `const deleteLesson = async (chapterId, lessonId) => {
    try {
      await api.delete(\`/courses/chapters/\${chapterId}/lessons/\${lessonId}\`);`,
  `const deleteLesson = async (chapterId, lessonId) => {
    try {
      await api.delete(\`/courses/chapters/\${chapterId}/lessons/\${lessonId}\`);`
);

// Update handleChapterDragEnd - need to find the api.put call and modify
content = content.replace(
  `api.put(\`/courses/\${id}/chapters/reorder\`, {
    chapters: reordered.map((ch, idx) => ({
      id: ch._id,
      position: idx,
    })),
  }).catch(() => toast.error("Failed to save chapter order"));`,
  `const courseIdToUse = isEditing ? id : createdCourseId;
    api.put(\`/courses/\${courseIdToUse}/chapters/reorder\`, {
      chapters: reordered.map((ch, idx) => ({
        id: ch._id,
        position: idx,
      })),
    }).catch(() => toast.error("Failed to save chapter order"));`
);

// Update handleLessonDragEnd
content = content.replace(
  `api
      .put(\`/courses/chapters/\${chapterId}/lessons/reorder\`, {
        lessons: reordered.map((l, idx) => ({
          id: l._id,
          position: idx,
        })),
      })
      .catch(() => toast.error("Failed to save lesson order"));`,
  `const courseIdToUse = isEditing ? id : createdCourseId;
    api
      .put(\`/courses/\${courseIdToUse}/chapters/\${chapterId}/lessons/reorder\`, {
        lessons: reordered.map((l, idx) => ({
          id: l._id,
          position: idx,
        })),
      })
      .catch(() => toast.error("Failed to save lesson order"));`
);

fs.writeFileSync(path, content);
console.log('Successfully transformed create-course.jsx to use tabs in both modes');

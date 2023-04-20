<script>
  import { blurOnEscape } from '$lib/utils/directives';
</script>

<div class="p-4">
  <h1 class="mb-4 block text-center text-2xl font-bold">New Form</h1>
  <form class="mx-auto grid grid-cols-3 gap-2 rounded-md border bg-white p-4">
    <!-- Input semester -->
    <div class="col-span-1 flex items-center text-left font-semibold">
      <label class="w-full after:ml-0.5 after:text-red-500 after:content-['*']" for="year">
        Semester
      </label>
    </div>
    <div class="col-span-2">
      <select
        id="semester"
        name="semester"
        class="w-full rounded-t-md border px-4 py-2 outline-none transition duration-150 focus:bg-slate-100"
        use:blurOnEscape
      >
        <option value="1">1</option>
        <option value="2">2</option>
      </select>
    </div>
    <!-- End input semester -->
    <!-- Input group -->
    <div class="flex items-center text-left font-semibold">
      <label class="w-full after:ml-0.5 after:text-red-500 after:content-['*']" for="group">
        Groups
      </label>
    </div>
    <div class="grid grid-cols-5">
      <div>
        <label class="font-semibold"><input type="checkbox" value="com-eng1" /> com-eng1</label>
      </div>
      <div>
        <label class="font-semibold"><input type="checkbox" value="com-eng1" /> com-eng1</label>
      </div>
      <div>
        <label class="font-semibold"><input type="checkbox" value="com-eng1" /> com-eng1</label>
      </div>
      <div>
        <label class="font-semibold"><input type="checkbox" value="com-eng1" /> com-eng1</label>
      </div>
      <div>
        <label class="font-semibold"><input type="checkbox" value="com-eng1" /> com-eng1</label>
      </div>
      <div>
        <label class="font-semibold"><input type="checkbox" value="com-eng1" /> com-eng1</label>
      </div>
      <div>
        <label class="font-semibold"><input type="checkbox" value="com-eng1" /> com-eng1</label>
      </div>
      <div>
        <label class="font-semibold"><input type="checkbox" value="com-eng1" /> com-eng1</label>
      </div>
      <div>
        <label class="font-semibold"><input type="checkbox" value="com-eng1" /> com-eng1</label>
      </div>
      <div>
        <label class="font-semibold"><input type="checkbox" value="com-eng1" /> com-eng1</label>
      </div>
    </div>
    <!-- End input group -->
    <div class="col-span-3 col-start-1 mt-4">
      <button
        type="button"
        class="w-full cursor-pointer whitespace-nowrap rounded border border-slate-900 bg-slate-900 px-4 py-2 font-semibold text-slate-100 outline-none transition duration-150 hover:bg-slate-800 focus:ring focus:ring-slate-400/70 disabled:cursor-default disabled:border-slate-600 disabled:bg-slate-600"
      >
        Next
      </button>
    </div>
  </form>

  <form class="mx-auto grid grid-cols-6 gap-2 rounded-md border bg-white p-4">
    <h1 class="col-span-6 mb-4 block text-xl font-bold">Group: Com-eng1</h1>
    <!-- Input year -->
    <div class="col-span-1 flex items-center text-left font-semibold">
      <label class="w-full after:ml-0.5 after:text-red-500 after:content-['*']" for="year">
        Year
      </label>
    </div>
    <div class="col-span-2">
      <select
        id="semester"
        name="semester"
        class="w-full rounded-t-md border px-4 py-2 outline-none transition duration-150 focus:bg-slate-100"
        use:blurOnEscape
      >
        <option value="1">1</option>
        <option value="2">2</option>
        <option value="3">3</option>
        <option value="4">4</option>
      </select>
    </div>
    <!-- End input year -->
    <!-- Input subject -->
    <div class="col-span-1 col-start-1 flex items-center text-left font-semibold">
      <label class="w-full after:ml-0.5 after:text-red-500 after:content-['*']" for="group">
        Subject
      </label>
    </div>
    <div class="col-span-5 grid grid-cols-5">
      <div>
        <label class="font-semibold"
          ><input type="checkbox" value="computer programing" /> computer programing</label
        >
      </div>
      <div>
        <label class="font-semibold"
          ><input type="checkbox" value="data security" /> data security</label
        >
      </div>
      <div>
        <label class="font-semibold"
          ><input type="checkbox" value="computer network" /> computer network</label
        >
      </div>
      <div>
        <label class="font-semibold"
          ><input type="checkbox" value="computer programing" /> computer programing</label
        >
      </div>
      <div>
        <label class="font-semibold"
          ><input type="checkbox" value="data security" /> data security</label
        >
      </div>
      <div>
        <label class="font-semibold"
          ><input type="checkbox" value="computer network" /> computer network</label
        >
      </div>
      <div>
        <label class="font-semibold"
          ><input type="checkbox" value="computer programing" /> computer programing</label
        >
      </div>
      <div>
        <label class="font-semibold"
          ><input type="checkbox" value="data security" /> data security</label
        >
      </div>
      <div>
        <label class="font-semibold"
          ><input type="checkbox" value="computer network" /> computer network</label
        >
      </div>
    </div>
    <!-- End input group -->
    <h1 class="col-span-6 mb-4 block text-xl font-bold">Group: Com-eng2</h1>
    <!-- Input year -->
    <div class="col-span-1 flex items-center text-left font-semibold">
      <label class="w-full after:ml-0.5 after:text-red-500 after:content-['*']" for="year">
        Year
      </label>
    </div>
    <div class="col-span-2">
      <select
        id="semester"
        name="semester"
        class="w-full rounded-t-md border px-4 py-2 outline-none transition duration-150 focus:bg-slate-100"
        use:blurOnEscape
      >
        <option value="1">1</option>
        <option value="2">2</option>
        <option value="3">3</option>
        <option value="4">4</option>
      </select>
    </div>
    <!-- End input year -->
    <!-- Input subject -->
    <div class="col-span-1 col-start-1 flex items-center text-left font-semibold">
      <label class="w-full after:ml-0.5 after:text-red-500 after:content-['*']" for="group">
        Subject
      </label>
    </div>
    <div class="col-span-5 grid grid-cols-5">
      <div>
        <label class="font-semibold"
          ><input type="checkbox" value="computer programing" /> computer programing</label
        >
      </div>
      <div>
        <label class="font-semibold"
          ><input type="checkbox" value="data security" /> data security</label
        >
      </div>
      <div>
        <label class="font-semibold"
          ><input type="checkbox" value="computer network" /> computer network</label
        >
      </div>
      <div>
        <label class="font-semibold"
          ><input type="checkbox" value="computer programing" /> computer programing</label
        >
      </div>
      <div>
        <label class="font-semibold"
          ><input type="checkbox" value="data security" /> data security</label
        >
      </div>
      <div>
        <label class="font-semibold"
          ><input type="checkbox" value="computer network" /> computer network</label
        >
      </div>
      <div>
        <label class="font-semibold"
          ><input type="checkbox" value="computer programing" /> computer programing</label
        >
      </div>
      <div>
        <label class="font-semibold"
          ><input type="checkbox" value="data security" /> data security</label
        >
      </div>
      <div>
        <label class="font-semibold"
          ><input type="checkbox" value="computer network" /> computer network</label
        >
      </div>
    </div>
    <!-- End input subject -->
    <div class="col-span-6 mt-4">
      <button
        type="button"
        class="w-full cursor-pointer whitespace-nowrap rounded border border-slate-900 bg-slate-900 px-4 py-2 font-semibold text-slate-100 outline-none transition duration-150 hover:bg-slate-800 focus:ring focus:ring-slate-400/70 disabled:cursor-default disabled:border-slate-600 disabled:bg-slate-600"
      >
        Next
      </button>
    </div>
  </form>

  <form class="mx-auto grid grid-cols-6 gap-2 rounded-md border bg-white p-4">
    <h1 class="col-span-6 mb-4 block text-xl font-bold">Group: Com-eng1</h1>
    <div
      class="col-span-2 text-lg font-semibold after:ml-0.5 after:text-red-500 after:content-['*']"
    >
      Computer Programing for
      <input
        type="text"
        value="1"
        class="w-16 rounded-t-md border-b-2 px-4 py-2 text-center outline-none transition duration-150 focus:bg-slate-100"
        use:blurOnEscape
      /> sections(s)
    </div>
    <div
      class="col-span-2 text-lg font-semibold after:ml-0.5 after:text-red-500 after:content-['*']"
    >
      <label class="font-semibold"
        ><input type="checkbox" value="computer network" /> Assign same instructor for every sections</label
      >
    </div>
    <!-- Input instructor -->
    <div class="col-span-2 col-start-1 flex items-center text-left font-semibold">
      <label class="w-full after:ml-0.5 after:text-red-500 after:content-['*']" for="instructor">
        Instructor for Computer Prigraming Main Section
      </label>
    </div>
    <div class="col-span-2">
      <select
        id="instructor"
        name="instructor"
        class="w-full rounded-t-md border px-4 py-2 outline-none transition duration-150 focus:bg-slate-100"
        use:blurOnEscape
        multiple
      >
        <option value="Tontoey">Tontoey</option>
        <option value="Johny">Johny</option>
        <option value="Auksorn">Auksorn</option>
        <option value="Mek">Mek</option>
      </select>
    </div>
    <!-- End input instructor -->
    <!-- Input instructor -->
    <div class="col-span-2 col-start-1 flex items-center text-left font-semibold">
      <label class="w-full after:ml-0.5 after:text-red-500 after:content-['*']" for="instructor">
        Instructor for Computer Prigraming Lab Section 1
      </label>
    </div>
    <div class="col-span-2">
      <select
        id="instructor"
        name="instructor"
        class="w-full rounded-t-md border px-4 py-2 outline-none transition duration-150 focus:bg-slate-100"
        use:blurOnEscape
        multiple
      >
        <option value="Tontoey">Tontoey</option>
        <option value="Johny">Johny</option>
        <option value="Auksorn">Auksorn</option>
        <option value="Mek">Mek</option>
      </select>
    </div>
    <!-- End input instructor -->
    <!-- Input instructor -->
    <div class="col-span-2 col-start-1 flex items-center text-left font-semibold">
      <label class="w-full after:ml-0.5 after:text-red-500 after:content-['*']" for="instructor">
        Instructor for Computer Prigraming Lab Section 2
      </label>
    </div>
    <div class="col-span-2">
      <select
        id="instructor"
        name="instructor"
        class="w-full rounded-t-md border px-4 py-2 outline-none transition duration-150 focus:bg-slate-100"
        use:blurOnEscape
        multiple
      >
        <option value="Tontoey">Tontoey</option>
        <option value="Johny">Johny</option>
        <option value="Auksorn">Auksorn</option>
        <option value="Mek">Mek</option>
      </select>
    </div>
    <!-- End input instructor -->
    <div class="col-span-6 mt-4">
      <button
        type="button"
        class="w-full cursor-pointer whitespace-nowrap rounded border border-slate-900 bg-slate-900 px-4 py-2 font-semibold text-slate-100 outline-none transition duration-150 hover:bg-slate-800 focus:ring focus:ring-slate-400/70 disabled:cursor-default disabled:border-slate-600 disabled:bg-slate-600"
      >
        Next
      </button>
    </div>
  </form>
</div>

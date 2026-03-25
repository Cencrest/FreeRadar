export function SearchForm({
  defaultQ = "",
  defaultZip = "",
  defaultCategory = ""
}: {
  defaultQ?: string;
  defaultZip?: string;
  defaultCategory?: string;
}) {
  return (
    <form action="/listings" method="get" className="search-form card">
      <div className="field">
        <label htmlFor="q">Keyword</label>
        <input id="q" name="q" placeholder="couch, dresser, bike..." defaultValue={defaultQ} />
      </div>
      <div className="field">
        <label htmlFor="zip">ZIP code</label>
        <input id="zip" name="zip" placeholder="10001" defaultValue={defaultZip} />
      </div>
      <div className="field">
        <label htmlFor="category">Category</label>
        <select id="category" name="category" defaultValue={defaultCategory || "all"}>
          <option value="all">All categories</option>
          <option value="furniture">Furniture</option>
          <option value="appliances">Appliances</option>
          <option value="electronics">Electronics</option>
          <option value="home">Home</option>
          <option value="baby">Baby</option>
          <option value="tools">Tools</option>
          <option value="outdoors">Outdoors</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div className="field action-field">
        <button className="button" type="submit">
          Search
        </button>
      </div>
    </form>
  );
}

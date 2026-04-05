export function SearchForm({
  defaultQ = "",
  defaultCategory = "",
  defaultBorough = "",
}: {
  defaultQ?: string;
  defaultCategory?: string;
  defaultBorough?: string;
}) {
  return (
    <form
      action="/listings"
      method="get"
      className="card"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: "12px",
        alignItems: "end",
        padding: "16px",
      }}
    >
      <div className="field" style={{ margin: 0 }}>
        <label htmlFor="q">Keyword</label>
        <input
          id="q"
          name="q"
          placeholder="couch, dresser, bike..."
          defaultValue={defaultQ}
        />
      </div>

      <div className="field" style={{ margin: 0 }}>
        <label htmlFor="borough">Borough</label>
        <select
          id="borough"
          name="borough"
          defaultValue={defaultBorough || "all"}
        >
          <option value="all">All boroughs</option>
          <option value="manhattan">Manhattan</option>
          <option value="brooklyn">Brooklyn</option>
          <option value="queens">Queens</option>
          <option value="bronx">Bronx</option>
          <option value="staten island">Staten Island</option>
        </select>
      </div>

      <div className="field" style={{ margin: 0 }}>
        <label htmlFor="category">Category</label>
        <select
          id="category"
          name="category"
          defaultValue={defaultCategory || "all"}
        >
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

      <div className="field action-field" style={{ margin: 0 }}>
        <button className="button" type="submit" style={{ width: "100%" }}>
          Search
        </button>
      </div>
    </form>
  );
}

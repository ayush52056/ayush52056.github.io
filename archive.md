---
layout: page
title: Archive
permalink: /archive/
---

{% assign posts_by_year = site.posts | group_by_exp: "post", "post.date | date: '%Y'" %}
<div class="archive-list">
  {% for year in posts_by_year %}
    <section class="archive-year">
      <h2>{{ year.name }}</h2>
      <ol>
        {% for post in year.items %}
          <li>
            <time datetime="{{ post.date | date_to_xmlschema }}">{{ post.date | date: "%b %d" }}</time>
            <a href="{{ post.url | relative_url }}">{{ post.title }}</a>
          </li>
        {% endfor %}
      </ol>
    </section>
  {% endfor %}
</div>

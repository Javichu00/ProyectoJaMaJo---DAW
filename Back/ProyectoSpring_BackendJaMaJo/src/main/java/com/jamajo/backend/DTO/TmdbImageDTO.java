package com.jamajo.backend.DTO;

public class TmdbImageDTO {

    private String url;
    private Integer width;
    private Integer height;

    public TmdbImageDTO(String url, Integer width, Integer height) {
        this.url = url;
        this.width = width;
        this.height = height;
    }

    public String getUrl() { return url; }
    public Integer getWidth() { return width; }
    public Integer getHeight() { return height; }
}
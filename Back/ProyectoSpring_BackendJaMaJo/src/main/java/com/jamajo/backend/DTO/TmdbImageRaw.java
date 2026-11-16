package com.jamajo.backend.DTO;

import com.fasterxml.jackson.annotation.JsonProperty;

public class TmdbImageRaw {

    @JsonProperty("file_path")
    private String filePath;

    private Integer width;
    private Integer height;

    public String getFilePath() {
        return filePath;
    }

    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }

    public Integer getWidth() {
        return width;
    }

    public void setWidth(Integer width) {
        this.width = width;
    }

    public Integer getHeight() {
        return height;
    }

    public void setHeight(Integer height) {
        this.height = height;
    }
}